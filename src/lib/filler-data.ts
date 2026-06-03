/**
 * Filler Episode Data Integration
 * Source: https://github.com/xsunzukz/anime-filler-episodes-api
 * 
 * We store a local copy of the filler data and sync periodically.
 * This module handles parsing and normalization of filler episode data.
 */

export interface FillerEntry {
  title: string;
  slug: string;
  totalEpisodes: number;
  fillerEpisodes: number[];
  mixedCanonFillerEpisodes: number[];
  canonEpisodes: number[];
}

// Well-known filler data for popular anime (embedded for reliability)
// In production, this would be fetched from the GitHub API or a local JSON file
const FILLER_DATABASE: FillerEntry[] = [
  {
    title: "Naruto",
    slug: "naruto",
    totalEpisodes: 220,
    fillerEpisodes: [26, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219],
    mixedCanonFillerEpisodes: [1, 6, 8, 12, 33, 59, 96, 135, 220],
    canonEpisodes: [],
  },
  {
    title: "Naruto: Shippuuden",
    slug: "naruto-shippuden",
    totalEpisodes: 500,
    fillerEpisodes: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 144, 145, 146, 147, 148, 149, 150, 151, 170, 171, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 257, 258, 259, 260, 271, 279, 280, 281, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483],
    mixedCanonFillerEpisodes: [56, 90, 115, 116, 152, 211, 212, 213, 256, 261, 270, 278, 282, 283],
    canonEpisodes: [],
  },
  {
    title: "Bleach",
    slug: "bleach",
    totalEpisodes: 366,
    fillerEpisodes: [33, 50, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 147, 148, 149, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355],
    mixedCanonFillerEpisodes: [32, 63, 127, 138, 139, 140, 141, 142, 143, 144, 145, 146, 166, 167, 203, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286],
    canonEpisodes: [],
  },
  {
    title: "One Piece",
    slug: "one-piece",
    totalEpisodes: 1100,
    fillerEpisodes: [54, 55, 56, 57, 58, 59, 60, 61, 98, 99, 100, 101, 102, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 220, 221, 222, 223, 224, 225, 226, 279, 280, 281, 282, 283, 291, 292, 303, 317, 318, 319, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 492, 493, 497, 506, 507, 542, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 626, 627, 628, 629, 630, 631, 632, 633, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740, 741, 742, 743, 744, 745, 746, 747, 748, 749, 750],
    mixedCanonFillerEpisodes: [53, 62, 63, 68, 69, 96, 97, 127, 128, 129, 130, 144, 145, 195, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 227, 278],
    canonEpisodes: [],
  },
  {
    title: "Dragon Ball Z",
    slug: "dragon-ball-z",
    totalEpisodes: 291,
    fillerEpisodes: [9, 10, 11, 12, 13, 14, 15, 16, 17, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 100, 102, 108, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 170, 171, 174, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 287, 288, 289, 290, 291],
    mixedCanonFillerEpisodes: [1, 2, 8, 77, 78, 79, 80, 81, 82, 83, 99, 101, 103, 104, 105, 106, 107, 109, 110, 111, 112, 113, 114, 115, 169, 172, 173, 175, 194, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286],
    canonEpisodes: [],
  },
  {
    title: "Fairy Tail",
    slug: "fairy-tail",
    totalEpisodes: 328,
    fillerEpisodes: [9, 19, 20, 49, 50, 51, 69, 70, 71, 72, 73, 74, 75, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226],
    mixedCanonFillerEpisodes: [1, 2, 8, 10, 18, 48, 68, 124],
    canonEpisodes: [],
  },
  {
    title: "Boruto: Naruto Next Generations",
    slug: "boruto-naruto-next-generations",
    totalEpisodes: 293,
    fillerEpisodes: [16, 17, 33, 34, 35, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 67, 68, 69, 70, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255],
    mixedCanonFillerEpisodes: [15, 18, 19, 32, 36, 37, 38, 39, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 151],
    canonEpisodes: [],
  },
  {
    title: "Black Clover",
    slug: "black-clover",
    totalEpisodes: 170,
    fillerEpisodes: [29, 55, 56, 66, 68, 82, 83, 123, 124, 125, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157],
    mixedCanonFillerEpisodes: [28, 54, 65, 67, 81, 103, 122, 130],
    canonEpisodes: [],
  },
  {
    title: "Gintama",
    slug: "gintama",
    totalEpisodes: 367,
    fillerEpisodes: [25, 50, 75, 100, 119, 120, 121, 125, 150, 153, 172, 173, 174, 175, 176, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 225, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295],
    mixedCanonFillerEpisodes: [24, 49, 74, 99, 118, 124, 149, 151, 152, 171, 183, 224, 229],
    canonEpisodes: [],
  },
  {
    title: "Dragon Ball",
    slug: "dragon-ball",
    totalEpisodes: 153,
    fillerEpisodes: [4, 5, 9, 10, 11, 12, 27, 28, 29, 30, 31, 32, 33, 39, 40, 41, 42, 43, 44, 45, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153],
    mixedCanonFillerEpisodes: [3, 8, 26, 38, 68, 85, 125],
    canonEpisodes: [],
  },
];

/**
 * Fetch filler data from the GitHub repository
 */
export async function fetchFillerDataFromGitHub(): Promise<FillerEntry[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/xsunzukz/anime-filler-episodes-api/main/data.json"
    );
    if (!response.ok) {
      console.warn("Failed to fetch filler data from GitHub, using local data");
      return FILLER_DATABASE;
    }
    const data = await response.json();
    // Normalize the data format
    if (Array.isArray(data)) {
      return data.map(normalizeFillerEntry);
    }
    return FILLER_DATABASE;
  } catch {
    console.warn("Error fetching filler data, using local database");
    return FILLER_DATABASE;
  }
}

function normalizeFillerEntry(entry: Record<string, unknown>): FillerEntry {
  const title = (entry.title || entry.name || "") as string;
  return {
    title,
    slug: generateFillerSlug(title),
    totalEpisodes: (entry.totalEpisodes || entry.total_episodes || 0) as number,
    fillerEpisodes: parseEpisodeList(entry.fillerEpisodes || entry.filler_episodes || entry.filler),
    mixedCanonFillerEpisodes: parseEpisodeList(entry.mixedCanonFillerEpisodes || entry.mixed_canon_filler || entry.mixed),
    canonEpisodes: parseEpisodeList(entry.canonEpisodes || entry.canon_episodes || entry.canon),
  };
}

function parseEpisodeList(data: unknown): number[] {
  if (Array.isArray(data)) {
    return data.map(Number).filter((n) => !isNaN(n));
  }
  if (typeof data === "string") {
    // Parse ranges like "1-5, 10, 12-15"
    const episodes: number[] = [];
    const parts = data.split(",").map((s) => s.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          episodes.push(i);
        }
      } else {
        const num = Number(part);
        if (!isNaN(num)) episodes.push(num);
      }
    }
    return episodes;
  }
  return [];
}

function generateFillerSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Get filler data for a specific anime by slug or title match
 */
export function getFillerDataBySlug(slug: string): FillerEntry | null {
  return FILLER_DATABASE.find((entry) => entry.slug === slug) || null;
}

export function getFillerDataByTitle(title: string): FillerEntry | null {
  const normalizedTitle = title.toLowerCase();
  return (
    FILLER_DATABASE.find(
      (entry) =>
        entry.title.toLowerCase() === normalizedTitle ||
        entry.slug === generateFillerSlug(title)
    ) || null
  );
}

export function getAllFillerData(): FillerEntry[] {
  return FILLER_DATABASE;
}

export function calculateFillerStats(entry: FillerEntry) {
  const totalFiller = entry.fillerEpisodes.length;
  const totalMixed = entry.mixedCanonFillerEpisodes.length;
  const totalCanon = entry.totalEpisodes - totalFiller - totalMixed;
  const fillerPercent = entry.totalEpisodes > 0 
    ? Math.round((totalFiller / entry.totalEpisodes) * 100) 
    : 0;

  return {
    totalFiller,
    totalMixed,
    totalCanon: Math.max(0, totalCanon),
    fillerPercent,
  };
}
