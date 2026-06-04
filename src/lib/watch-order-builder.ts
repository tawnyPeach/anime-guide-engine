import prisma from "@/lib/prisma";

export interface WatchOrderEntry {
  animeId: number;
  title: string;
  slug: string;
  format: string | null;
  totalEpisodes: number;
  seasonYear: number | null;
  relationType: string;
  isCurrentAnime: boolean;
}

export interface WatchOrderResult {
  mainOrder: WatchOrderEntry[];
  supplementary: WatchOrderEntry[];
  totalEntries: number;
}

interface AnimeNode {
  id: number;
  title: string;
  titleEnglish: string | null;
  slug: string;
  format: string | null;
  totalEpisodes: number;
  seasonYear: number | null;
}

interface RelationEdge {
  fromAnimeId: number;
  toAnimeId: number;
  relationType: string;
}

const TRAVERSABLE_RELATIONS = new Set([
  "PREQUEL",
  "SEQUEL",
  "SIDE_STORY",
  "PARENT",
  "SPIN_OFF",
]);

const MAIN_RELATIONS = new Set(["PREQUEL", "SEQUEL"]);

/**
 * Builds the full franchise watch order by traversing the entire relation graph
 * starting from the given anime. Uses BFS to discover all connected anime,
 * then topologically sorts PREQUEL/SEQUEL chains for the main order.
 */
export async function buildFullWatchOrder(
  animeId: number
): Promise<WatchOrderResult> {
  // Step 1: Collect all franchise members via BFS
  const visited = new Set<number>();
  const queue: number[] = [animeId];
  visited.add(animeId);

  const allRelations: RelationEdge[] = [];

  while (queue.length > 0) {
    const currentBatch = [...queue];
    queue.length = 0;

    // Fetch all relations for the current batch in bulk
    const relations = await prisma.animeRelation.findMany({
      where: {
        OR: [
          { fromAnimeId: { in: currentBatch } },
          { toAnimeId: { in: currentBatch } },
        ],
      },
    });

    for (const rel of relations) {
      if (!TRAVERSABLE_RELATIONS.has(rel.relationType)) continue;

      allRelations.push({
        fromAnimeId: rel.fromAnimeId,
        toAnimeId: rel.toAnimeId,
        relationType: rel.relationType,
      });

      // Discover new anime IDs
      if (!visited.has(rel.fromAnimeId)) {
        visited.add(rel.fromAnimeId);
        queue.push(rel.fromAnimeId);
      }
      if (!visited.has(rel.toAnimeId)) {
        visited.add(rel.toAnimeId);
        queue.push(rel.toAnimeId);
      }
    }
  }

  // If no relations found, this is a standalone anime
  if (visited.size <= 1) {
    return { mainOrder: [], supplementary: [], totalEntries: 0 };
  }

  // Step 2: Fetch all anime info in bulk
  const animeList = await prisma.anime.findMany({
    where: { id: { in: Array.from(visited) } },
    select: {
      id: true,
      title: true,
      titleEnglish: true,
      slug: true,
      format: true,
      totalEpisodes: true,
      seasonYear: true,
    },
  });

  const animeMap = new Map<number, AnimeNode>();
  for (const a of animeList) {
    animeMap.set(a.id, a);
  }

  // Step 3: Build directed graph for PREQUEL/SEQUEL relations
  // A SEQUEL relation means: fromAnime -> toAnime (fromAnime is before toAnime)
  // A PREQUEL relation means: fromAnime -> toAnime (toAnime is before fromAnime)
  // We normalize to a "comes before" graph: edge A -> B means A should be watched before B
  const sequelGraph = new Map<number, Set<number>>(); // adjacency: id -> set of successors
  const inDegree = new Map<number, number>();
  const mainNodeIds = new Set<number>();
  const supplementaryNodeIds = new Set<number>();

  // Deduplicate relations
  const seenEdges = new Set<string>();

  for (const rel of allRelations) {
    if (!animeMap.has(rel.fromAnimeId) || !animeMap.has(rel.toAnimeId)) continue;

    if (MAIN_RELATIONS.has(rel.relationType)) {
      let before: number;
      let after: number;

      if (rel.relationType === "SEQUEL") {
        // fromAnime comes before toAnime
        before = rel.fromAnimeId;
        after = rel.toAnimeId;
      } else {
        // PREQUEL: toAnime comes before fromAnime
        before = rel.toAnimeId;
        after = rel.fromAnimeId;
      }

      const edgeKey = `${before}->${after}`;
      if (seenEdges.has(edgeKey)) continue;
      seenEdges.add(edgeKey);

      mainNodeIds.add(before);
      mainNodeIds.add(after);

      if (!sequelGraph.has(before)) sequelGraph.set(before, new Set());
      sequelGraph.get(before)!.add(after);

      inDegree.set(after, (inDegree.get(after) || 0) + 1);
      if (!inDegree.has(before)) inDegree.set(before, 0);
    } else {
      // SIDE_STORY, SPIN_OFF, PARENT - mark as supplementary
      supplementaryNodeIds.add(rel.fromAnimeId);
      supplementaryNodeIds.add(rel.toAnimeId);
    }
  }

  // Step 4: Topological sort of the main SEQUEL chain
  // Find root nodes (no prequels - inDegree 0)
  const mainOrder: number[] = [];
  const topoQueue: number[] = [];

  for (const nodeId of mainNodeIds) {
    if ((inDegree.get(nodeId) || 0) === 0) {
      topoQueue.push(nodeId);
    }
  }

  // Sort roots by seasonYear for deterministic ordering
  topoQueue.sort((a, b) => {
    const aYear = animeMap.get(a)?.seasonYear || 9999;
    const bYear = animeMap.get(b)?.seasonYear || 9999;
    return aYear - bYear;
  });

  // BFS-based topological sort (Kahn's algorithm)
  const topoVisited = new Set<number>();
  while (topoQueue.length > 0) {
    const node = topoQueue.shift()!;
    if (topoVisited.has(node)) continue;
    topoVisited.add(node);
    mainOrder.push(node);

    const successors = sequelGraph.get(node);
    if (successors) {
      // Sort successors by year for deterministic order
      const sortedSuccessors = [...successors].sort((a, b) => {
        const aYear = animeMap.get(a)?.seasonYear || 9999;
        const bYear = animeMap.get(b)?.seasonYear || 9999;
        return aYear - bYear;
      });

      for (const succ of sortedSuccessors) {
        const newDeg = (inDegree.get(succ) || 1) - 1;
        inDegree.set(succ, newDeg);
        if (newDeg <= 0 && !topoVisited.has(succ)) {
          topoQueue.push(succ);
        }
      }
    }
  }

  // Handle any main nodes missed due to cycles - add them sorted by year
  for (const nodeId of mainNodeIds) {
    if (!topoVisited.has(nodeId)) {
      mainOrder.push(nodeId);
    }
  }

  // Step 5: Build result arrays
  const mainEntries: WatchOrderEntry[] = mainOrder
    .filter((id) => animeMap.has(id))
    .map((id) => {
      const node = animeMap.get(id)!;
      return {
        animeId: node.id,
        title: node.titleEnglish || node.title,
        slug: node.slug,
        format: node.format,
        totalEpisodes: node.totalEpisodes,
        seasonYear: node.seasonYear,
        relationType: id === animeId ? "CURRENT" : "SEQUEL",
        isCurrentAnime: id === animeId,
      };
    });

  // Ensure the current anime appears in the main order
  if (mainEntries.length > 0 && !mainEntries.some((e) => e.isCurrentAnime)) {
    const node = animeMap.get(animeId);
    if (node) {
      mainEntries.unshift({
        animeId: node.id,
        title: node.titleEnglish || node.title,
        slug: node.slug,
        format: node.format,
        totalEpisodes: node.totalEpisodes,
        seasonYear: node.seasonYear,
        relationType: "CURRENT",
        isCurrentAnime: true,
      });
    }
  }

  // Supplementary: entries that are ONLY in supplementary (not in main chain)
  const mainIdSet = new Set(mainOrder);
  const suppEntries: WatchOrderEntry[] = [];

  for (const id of supplementaryNodeIds) {
    if (mainIdSet.has(id)) continue;
    const node = animeMap.get(id);
    if (!node) continue;

    suppEntries.push({
      animeId: node.id,
      title: node.titleEnglish || node.title,
      slug: node.slug,
      format: node.format,
      totalEpisodes: node.totalEpisodes,
      seasonYear: node.seasonYear,
      relationType: "SIDE_STORY",
      isCurrentAnime: node.id === animeId,
    });
  }

  // Sort supplementary by year
  suppEntries.sort((a, b) => {
    const aYear = a.seasonYear || 9999;
    const bYear = b.seasonYear || 9999;
    return aYear - bYear;
  });

  // If the current anime isn't in the main order, check if it should be
  const currentInMain = mainEntries.some((e) => e.isCurrentAnime);
  if (!currentInMain && !suppEntries.some((e) => e.isCurrentAnime)) {
    // The current anime was only connected via supplementary relations
    // Add it to supplementary
    const node = animeMap.get(animeId);
    if (node) {
      suppEntries.unshift({
        animeId: node.id,
        title: node.titleEnglish || node.title,
        slug: node.slug,
        format: node.format,
        totalEpisodes: node.totalEpisodes,
        seasonYear: node.seasonYear,
        relationType: "CURRENT",
        isCurrentAnime: true,
      });
    }
  }

  return {
    mainOrder: mainEntries,
    supplementary: suppEntries,
    totalEntries: mainEntries.length + suppEntries.length,
  };
}
