/**
 * Filler Episode Data
 *
 * Local database of filler episode information for 100+ anime.
 * For fresh data from animefillerlist.com, run: npm run seed:filler
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
// To fetch updated filler data from animefillerlist.com, use: npm run seed:filler
const FILLER_DATABASE: FillerEntry[] = [
  // --- Long-running shonen with significant filler ---
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
  {
    title: "InuYasha",
    slug: "inuyasha",
    totalEpisodes: 167,
    fillerEpisodes: [59, 63, 64, 65, 72, 75, 76, 77, 78, 79, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 127, 128, 129, 130, 133, 134, 135, 136, 137, 138, 139, 140, 162, 163, 164, 165, 166, 167],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Rurouni Kenshin",
    slug: "rurouni-kenshin",
    totalEpisodes: 95,
    fillerEpisodes: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Soul Eater",
    slug: "soul-eater",
    totalEpisodes: 51,
    fillerEpisodes: [35, 36],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Katekyo Hitman Reborn",
    slug: "katekyo-hitman-reborn",
    totalEpisodes: 203,
    fillerEpisodes: [34, 35, 36, 37, 38, 39, 64, 74, 75, 79, 80, 81, 82, 97, 98, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Sailor Moon",
    slug: "sailor-moon",
    totalEpisodes: 200,
    fillerEpisodes: [2, 5, 6, 8, 13, 15, 16, 17, 19, 20, 21, 47, 48, 50, 52, 54, 55, 57, 58, 59, 61, 63, 67, 69, 70, 72, 73, 74, 76, 77, 78, 79, 80, 81, 82, 83, 87, 88, 93, 94, 95, 96, 97, 102, 103, 104, 105, 108, 109, 110, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Yu Yu Hakusho",
    slug: "yu-yu-hakusho",
    totalEpisodes: 112,
    fillerEpisodes: [27, 57, 58, 59],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Dragon Ball GT",
    slug: "dragon-ball-gt",
    totalEpisodes: 64,
    fillerEpisodes: [41, 42, 43, 44, 45, 46, 47, 48],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Dragon Ball Super",
    slug: "dragon-ball-super",
    totalEpisodes: 131,
    fillerEpisodes: [69, 70, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 86, 87, 88, 89, 90, 91],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "The Seven Deadly Sins",
    slug: "the-seven-deadly-sins",
    totalEpisodes: 100,
    fillerEpisodes: [14, 15],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Blue Exorcist",
    slug: "blue-exorcist",
    totalEpisodes: 25,
    fillerEpisodes: [17, 18, 19, 20, 21, 22, 23, 24, 25],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "My Hero Academia",
    slug: "my-hero-academia",
    totalEpisodes: 138,
    fillerEpisodes: [32, 33, 39, 58, 64, 104],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Pokemon",
    slug: "pokemon",
    totalEpisodes: 276,
    fillerEpisodes: [7, 9, 18, 19, 32, 33, 37, 38, 39, 40, 44, 45, 46, 49, 54, 55, 57, 60, 62, 63, 65, 66, 67, 68, 69, 70, 87, 88, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Detective Conan",
    slug: "detective-conan",
    totalEpisodes: 1100,
    fillerEpisodes: [6, 7, 11, 12, 13, 16, 17, 23, 24, 27, 28, 29, 30, 31, 33, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Fullmetal Alchemist 2003",
    slug: "fullmetal-alchemist-2003",
    totalEpisodes: 51,
    fillerEpisodes: [4, 10, 17, 37, 48, 49],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Ace of Diamond",
    slug: "ace-of-diamond",
    totalEpisodes: 126,
    fillerEpisodes: [39, 40, 41, 76, 101, 102, 103],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Claymore",
    slug: "claymore",
    totalEpisodes: 26,
    fillerEpisodes: [25, 26],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  {
    title: "Digimon Adventure",
    slug: "digimon-adventure",
    totalEpisodes: 54,
    fillerEpisodes: [6, 9, 11, 24, 25, 46, 47, 48, 49, 50, 51, 52, 53, 54],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Anime with verified filler data ---
  {
    title: "HUNTER×HUNTER (2011)",
    slug: "hunterhunter-2011",
    totalEpisodes: 148,
    fillerEpisodes: [13, 26],
    mixedCanonFillerEpisodes: [12],
    canonEpisodes: [],
  },
  {
    title: "DEATH NOTE",
    slug: "death-note",
    totalEpisodes: 37,
    fillerEpisodes: [],
    mixedCanonFillerEpisodes: [1, 25, 26, 37],
    canonEpisodes: [],
  },
  {
    title: "Ansatsu Kyoushitsu",
    slug: "ansatsu-kyoushitsu",
    totalEpisodes: 22,
    fillerEpisodes: [],
    mixedCanonFillerEpisodes: [5],
    canonEpisodes: [],
  },
  {
    title: "Tokyo Ghoul √A",
    slug: "tokyo-ghoul-a",
    totalEpisodes: 12,
    fillerEpisodes: [],
    mixedCanonFillerEpisodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    canonEpisodes: [],
  },
  {
    title: "Tengen Toppa Gurren Lagann",
    slug: "tengen-toppa-gurren-lagann",
    totalEpisodes: 27,
    fillerEpisodes: [16],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Yu-Gi-Oh! Duel Monsters ---
  {
    title: "Yu-Gi-Oh! Duel Monsters",
    slug: "yu-gi-oh-duel-monsters",
    totalEpisodes: 225,
    fillerEpisodes: [13,25,33,41,42,43,44,45,74,80,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,136,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,225],
    mixedCanonFillerEpisodes: [1,34,53,70,79,135,137],
    canonEpisodes: [],
  },
  // --- Yu-Gi-Oh! GX ---
  {
    title: "Yu-Gi-Oh! GX",
    slug: "yu-gi-oh-gx",
    totalEpisodes: 180,
    fillerEpisodes: [9,13,14,15,16,17,18,19,20,23,34,35,38,42,47,54,60,63,64,66,71,72,74,80,81,85,86,90,91,92,105,156,161,162,163,164,165,166,167],
    mixedCanonFillerEpisodes: [5,6,10,11,21,22,27,28,36,37,39,40,41,43,48,49,50,61,62,70,73,75,76,77,78,79,82,87,88,89,96,99],
    canonEpisodes: [],
  },
  // --- Yu-Gi-Oh! 5D's ---
  {
    title: "Yu-Gi-Oh! 5D's",
    slug: "yu-gi-oh-5ds",
    totalEpisodes: 154,
    fillerEpisodes: [67,68,69,70,74,75,76,77,78,79,86,90,91,92,93,95,96,97,98,99,100,101,102,103,104,105,106,115,116,122,124,131,140,141],
    mixedCanonFillerEpisodes: [73,81,82,87,88,89,119,120,121,123,125,126,127,128,129,130,139],
    canonEpisodes: [],
  },
  // --- Yu-Gi-Oh! Zexal ---
  {
    title: "Yu-Gi-Oh! Zexal",
    slug: "yu-gi-oh-zexal",
    totalEpisodes: 124,
    fillerEpisodes: [15,16,21,44,45],
    mixedCanonFillerEpisodes: [5,6,7,8,17,18,26,27,28,29,30,31,32,36,37,38,39,50,51,52,53],
    canonEpisodes: [],
  },
  // --- Yu-Gi-Oh! Arc-V ---
  {
    title: "Yu-Gi-Oh! Arc-V",
    slug: "yu-gi-oh-arc-v",
    totalEpisodes: 148,
    fillerEpisodes: [19,20],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Yu-Gi-Oh! VRAINS ---
  {
    title: "Yu-Gi-Oh! VRAINS",
    slug: "yu-gi-oh-vrains",
    totalEpisodes: 56,
    fillerEpisodes: [13,29,38],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Yu-Gi-Oh! Capsule Monsters ---
  {
    title: "Yu-Gi-Oh! Capsule Monsters",
    slug: "yu-gi-oh-capsule-monsters",
    totalEpisodes: 12,
    fillerEpisodes: [1,2,3,4,5,6,7,8,9,10,11,12],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Yu-Gi-Oh! (Toei 1998) ---
  {
    title: "Yu-Gi-Oh! (Toei)",
    slug: "yu-gi-oh-toei",
    totalEpisodes: 27,
    fillerEpisodes: [4,8,12,15,16,17,19,20],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- D.Gray-man ---
  {
    title: "D.Gray-man",
    slug: "d-gray-man",
    totalEpisodes: 116,
    fillerEpisodes: [14,15,16,17,18,25,27,29,30,31,32,33,34,35,36,41,42,43,44,45,46,47,48,49,50],
    mixedCanonFillerEpisodes: [26,63,64],
    canonEpisodes: [],
  },
  // --- Toriko ---
  {
    title: "Toriko",
    slug: "toriko",
    totalEpisodes: 147,
    fillerEpisodes: [1,42,43,51,69,70,80,81,82,86,99,112,113,124,125,130,131,147],
    mixedCanonFillerEpisodes: [146],
    canonEpisodes: [],
  },
  // --- Great Teacher Onizuka ---
  {
    title: "Great Teacher Onizuka",
    slug: "great-teacher-onizuka",
    totalEpisodes: 43,
    fillerEpisodes: [23,25,26,27,28,34,42,43],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Zatch Bell! ---
  {
    title: "Zatch Bell!",
    slug: "konjiki-no-gash-bell",
    totalEpisodes: 150,
    fillerEpisodes: [31,32,33,34,35,89,90,91,92,93,94,95,96,97,98,99,100,139,140,141,142,143,144,145,146,147,148,149,150],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Beelzebub ---
  {
    title: "Beelzebub",
    slug: "beelzebub",
    totalEpisodes: 60,
    fillerEpisodes: [11,12,13,14,27,28,52,53,54,55,56,57,60],
    mixedCanonFillerEpisodes: [15,17],
    canonEpisodes: [],
  },
  // --- Cardcaptor Sakura ---
  {
    title: "Cardcaptor Sakura",
    slug: "cardcaptor-sakura",
    totalEpisodes: 70,
    fillerEpisodes: [12,13,14,15,19,20,21,22,23,24,27,28,29,30,31,32,33,34,36,37,38,40,43,53,55,56,57,58,60,61,62,63,64],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Fist of the North Star ---
  {
    title: "Fist of the North Star",
    slug: "hokuto-no-ken",
    totalEpisodes: 152,
    fillerEpisodes: [9,10,14,15,16,17,18,19,20,21,38,41,79,80,81,82,98,105,109,111],
    mixedCanonFillerEpisodes: [2,4,5,6,7,8,12,22,23,24,25,26,27,29],
    canonEpisodes: [],
  },
  // --- Black Cat ---
  {
    title: "Black Cat",
    slug: "black-cat",
    totalEpisodes: 24,
    fillerEpisodes: [21,22,23,24],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Rosario + Vampire ---
  {
    title: "Rosario + Vampire",
    slug: "rosario-vampire",
    totalEpisodes: 26,
    fillerEpisodes: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Rosario + Vampire Capu2 ---
  {
    title: "Rosario + Vampire Capu2",
    slug: "rosario-vampire-capu2",
    totalEpisodes: 13,
    fillerEpisodes: [1,2,3,4,5,6,7,8,9,10,11,12,13],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Black Butler ---
  {
    title: "Black Butler",
    slug: "kuroshitsuji",
    totalEpisodes: 24,
    fillerEpisodes: [14,15,21,22,23,24],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- GANTZ ---
  {
    title: "GANTZ",
    slug: "gantz",
    totalEpisodes: 26,
    fillerEpisodes: [3,4,5,6,7,8,9,10,11,12,13,14,15,16],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Full Metal Panic! ---
  {
    title: "Full Metal Panic!",
    slug: "full-metal-panic",
    totalEpisodes: 24,
    fillerEpisodes: [5,10,13,16,22],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Hana-Yori Dango ---
  {
    title: "Hana-Yori Dango",
    slug: "hana-yori-dango",
    totalEpisodes: 51,
    fillerEpisodes: [18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Nana ---
  {
    title: "Nana",
    slug: "nana",
    totalEpisodes: 47,
    fillerEpisodes: [31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- School Days ---
  {
    title: "School Days",
    slug: "school-days",
    totalEpisodes: 12,
    fillerEpisodes: [3,4,5,6,7],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Spider Riders ---
  {
    title: "Spider Riders",
    slug: "spider-riders",
    totalEpisodes: 52,
    fillerEpisodes: [27,28,41,42,50,51,52],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- MegaMan NT Warrior ---
  {
    title: "MegaMan NT Warrior",
    slug: "megaman-nt-warrior",
    totalEpisodes: 56,
    fillerEpisodes: [35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Rock Lee & His Ninja Pals ---
  {
    title: "Naruto Spin-Off: Rock Lee & His Ninja Pals",
    slug: "naruto-spin-off-rock-lee-to-his-ninja-pals",
    totalEpisodes: 51,
    fillerEpisodes: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Kimagure Orange Road ---
  {
    title: "Kimagure Orange Road",
    slug: "kimagure-orange-road",
    totalEpisodes: 48,
    fillerEpisodes: [7,8,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- GetBackers ---
  {
    title: "GetBackers",
    slug: "getbackers",
    totalEpisodes: 49,
    fillerEpisodes: [30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Hayate the Combat Butler ---
  {
    title: "Hayate the Combat Butler",
    slug: "hayate-no-gotoku",
    totalEpisodes: 52,
    fillerEpisodes: [17,18,19,20,30,31,32,33,34],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Ikkitousen ---
  {
    title: "Ikkitousen",
    slug: "ikkitousen",
    totalEpisodes: 13,
    fillerEpisodes: [8,9,10,11,12,13],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Tenchi Muyo! ---
  {
    title: "Tenchi Muyo!",
    slug: "tenchi-muyo",
    totalEpisodes: 16,
    fillerEpisodes: [7,8,9,10,11,12,13,14,15,16],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Tenchi Universe ---
  {
    title: "Tenchi Universe",
    slug: "tenchi-universe",
    totalEpisodes: 26,
    fillerEpisodes: [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Tenchi Muyo! GXP ---
  {
    title: "Tenchi Muyo! GXP",
    slug: "tenchi-muyo-gxp",
    totalEpisodes: 26,
    fillerEpisodes: [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Mobile Suit Gundam Seed ---
  {
    title: "Mobile Suit Gundam Seed",
    slug: "mobile-suit-gundam-seed",
    totalEpisodes: 50,
    fillerEpisodes: [8,9,10,17,23,34,38,39,40],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Mobile Suit Gundam Seed Destiny ---
  {
    title: "Mobile Suit Gundam Seed Destiny",
    slug: "mobile-suit-gundam-seed-destiny",
    totalEpisodes: 50,
    fillerEpisodes: [5,6,7,8,9,10,15,16,34,35],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Digimon Adventure 02 ---
  {
    title: "Digimon Adventure 02",
    slug: "digimon-adventure-02",
    totalEpisodes: 50,
    fillerEpisodes: [13,14,22,23,32,33,38,39,40],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Digimon Tamers ---
  {
    title: "Digimon Tamers",
    slug: "digimon-tamers",
    totalEpisodes: 51,
    fillerEpisodes: [8,9,17,18,33,34,35],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Digimon Frontier ---
  {
    title: "Digimon Frontier",
    slug: "digimon-frontier",
    totalEpisodes: 50,
    fillerEpisodes: [6,7,8,15,16,22,23,29,30],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Seikon no Qwaser ---
  {
    title: "Seikon no Qwaser",
    slug: "seikon-no-qwaser",
    totalEpisodes: 24,
    fillerEpisodes: [6,7,12,13,18,19,20,21],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Hero: 108 ---
  {
    title: "Hero: 108",
    slug: "hero-108",
    totalEpisodes: 52,
    fillerEpisodes: [3,4,7,8,11,12,15,16,19,20,23,24,27,28,31,32,35,36,39,40,43,44,47,48,51,52],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Saint Seiya ---
  {
    title: "Saint Seiya",
    slug: "saint-seiya",
    totalEpisodes: 114,
    fillerEpisodes: [16,17,18,19,20,21,22,26,33,34,35,54,55,64,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Trigun ---
  {
    title: "Trigun",
    slug: "trigun",
    totalEpisodes: 26,
    fillerEpisodes: [1,2,3,6,10,11,13,16,17,19,20,21,22,23,24,25,26],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Ranma ½ ---
  {
    title: "Ranma ½",
    slug: "ranma-half",
    totalEpisodes: 161,
    fillerEpisodes: [14,21,46,48,49,50,51,52,54,56,57,58,59,60,62,63,64,66,70,71,73,74,77,78,81,83,84,86,87,90,91,92,94,97,98,99,100,101,102,103,104,108,109,111,112,113,115,116,117,118,119,120,123,124,127,131,134,135,137,138,139,140,145,147,148,150,152,153,156,157,159],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Shugo Chara! ---
  {
    title: "Shugo Chara!",
    slug: "shugo-chara",
    totalEpisodes: 126,
    fillerEpisodes: [14,15,16,19,20,24,35,46,47,48,57,58,60,63,66,68,72,84,85,86,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Magic Knight Rayearth ---
  {
    title: "Magic Knight Rayearth",
    slug: "magic-knight-rayearth",
    totalEpisodes: 49,
    fillerEpisodes: [7,8,9,11,14,17,24,25,28,29,30,31,33,34,35,36,37,41,46,48],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Tokyo Mew Mew ---
  {
    title: "Tokyo Mew Mew",
    slug: "tokyo-mew-mew",
    totalEpisodes: 52,
    fillerEpisodes: [5,6,8,9,14,15,16,20,22,23,24,29,30,31,32,33,34,35,39,42,43],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Soul Hunter ---
  {
    title: "Soul Hunter",
    slug: "hoshin-engi",
    totalEpisodes: 26,
    fillerEpisodes: [16,17,18,19,20,21,22,23,24,25,26],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Hellsing ---
  {
    title: "Hellsing",
    slug: "hellsing",
    totalEpisodes: 13,
    fillerEpisodes: [4,8,9,11,12,13],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Excel Saga ---
  {
    title: "Excel Saga",
    slug: "excel-saga",
    totalEpisodes: 26,
    fillerEpisodes: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Beyblade X ---
  {
    title: "Beyblade X",
    slug: "beyblade-x",
    totalEpisodes: 40,
    fillerEpisodes: [6,13,14,15,16,18,19,20,26,27,28,29,30,32],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Beyblade Burst QuadStrike ---
  {
    title: "Beyblade Burst QuadStrike",
    slug: "beyblade-burst-quadstrike",
    totalEpisodes: 26,
    fillerEpisodes: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Beyblade Metal Fusion ---
  {
    title: "Beyblade: Metal Fusion",
    slug: "beyblade-metal-fusion",
    totalEpisodes: 51,
    fillerEpisodes: [19,37],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Nadia: The Secret of Blue Water ---
  {
    title: "Nadia: The Secret of Blue Water",
    slug: "nadia-secret-of-blue-water",
    totalEpisodes: 39,
    fillerEpisodes: [24,26,29,32,33,34],
    mixedCanonFillerEpisodes: [27,28,30],
    canonEpisodes: [],
  },
  // --- Outlaw Star ---
  {
    title: "Outlaw Star",
    slug: "outlaw-star",
    totalEpisodes: 26,
    fillerEpisodes: [13,14,16,18,19,20],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Clannad ---
  {
    title: "Clannad",
    slug: "clannad",
    totalEpisodes: 24,
    fillerEpisodes: [13,14,16,17,18],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Clannad: After Story ---
  {
    title: "Clannad: After Story",
    slug: "clannad-after-story",
    totalEpisodes: 25,
    fillerEpisodes: [24],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Detective School Q ---
  {
    title: "Detective School Q",
    slug: "detective-school-q",
    totalEpisodes: 25,
    fillerEpisodes: [4,5,6,7,15],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- A Certain Scientific Railgun ---
  {
    title: "A Certain Scientific Railgun",
    slug: "a-certain-scientific-railgun",
    totalEpisodes: 73,
    fillerEpisodes: [3,13,14,17,18,19,31,41,42,43,44,45,46,47,48],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Ace Attorney ---
  {
    title: "Ace Attorney",
    slug: "ace-attorney",
    totalEpisodes: 47,
    fillerEpisodes: [13,30,34,35,36,38],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Goblin Slayer ---
  {
    title: "Goblin Slayer",
    slug: "goblin-slayer",
    totalEpisodes: 12,
    fillerEpisodes: [5,10],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Miss Kobayashi's Dragon Maid ---
  {
    title: "Miss Kobayashi's Dragon Maid",
    slug: "kobayashi-dragon-maid",
    totalEpisodes: 20,
    fillerEpisodes: [9,10,11],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Hikaru no Go ---
  {
    title: "Hikaru no Go",
    slug: "hikaru-no-go",
    totalEpisodes: 75,
    fillerEpisodes: [64,66],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Shadows House ---
  {
    title: "Shadows House",
    slug: "shadows-house",
    totalEpisodes: 25,
    fillerEpisodes: [12,13],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Campione! ---
  {
    title: "Campione!",
    slug: "campione",
    totalEpisodes: 13,
    fillerEpisodes: [2,5,13],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Urusei Yatsura ---
  {
    title: "Urusei Yatsura",
    slug: "urusei-yatsura",
    totalEpisodes: 167,
    fillerEpisodes: [71,75,78,84,93,95,98,99,100,101,103,104,105,106,107,112,118,126,138,143],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Hunter x Hunter (1999) ---
  {
    title: "Hunter x Hunter (1999)",
    slug: "hunter-x-hunter-1999",
    totalEpisodes: 92,
    fillerEpisodes: [15,26,68,70,77],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Highschool DxD ---
  {
    title: "Highschool DxD",
    slug: "highschool-dxd",
    totalEpisodes: 49,
    fillerEpisodes: [32,33,34],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Hajime no Ippo ---
  {
    title: "Hajime no Ippo: The Fighting!",
    slug: "hajime-no-ippo",
    totalEpisodes: 127,
    fillerEpisodes: [31,52],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Ghost in the Shell: Arise ---
  {
    title: "Ghost in the Shell: Arise",
    slug: "ghost-in-the-shell-arise",
    totalEpisodes: 10,
    fillerEpisodes: [3,7],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Slam Dunk ---
  {
    title: "Slam Dunk",
    slug: "slam-dunk",
    totalEpisodes: 101,
    fillerEpisodes: [1,18,31,42,49,51,56,59,66,67,73,78,87],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Mobile Suit Gundam ---
  {
    title: "Mobile Suit Gundam",
    slug: "mobile-suit-gundam",
    totalEpisodes: 43,
    fillerEpisodes: [14],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Negima! ---
  {
    title: "Negima!",
    slug: "negima",
    totalEpisodes: 26,
    fillerEpisodes: [12,13,21,26],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Fate/stay night (2006) ---
  {
    title: "Fate/stay night",
    slug: "fate-stay-night",
    totalEpisodes: 24,
    fillerEpisodes: [12,18,24],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- The Prince of Tennis ---
  {
    title: "The Prince of Tennis",
    slug: "prince-of-tennis",
    totalEpisodes: 177,
    fillerEpisodes: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Shaman King (2001) ---
  {
    title: "Shaman King (2001)",
    slug: "shaman-king-2001",
    totalEpisodes: 64,
    fillerEpisodes: [31,34,38,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Rave Master ---
  {
    title: "Rave Master",
    slug: "rave-master",
    totalEpisodes: 51,
    fillerEpisodes: [51],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- SKET Dance ---
  {
    title: "SKET Dance",
    slug: "sket-dance",
    totalEpisodes: 54,
    fillerEpisodes: [20,32],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- The Melancholy of Haruhi Suzumiya ---
  {
    title: "The Melancholy of Haruhi Suzumiya",
    slug: "suzumiya-haruhi",
    totalEpisodes: 28,
    fillerEpisodes: [1,2,3,4,5,6,7,8,9],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
  // --- Fate/Kaleid Liner Prisma Illya ---
  {
    title: "Fate/Kaleid Liner Prisma Illya",
    slug: "prisma-illya",
    totalEpisodes: 43,
    fillerEpisodes: [11,12,13],
    mixedCanonFillerEpisodes: [],
    canonEpisodes: [],
  },
];

/**
 * Get all filler data from the local database.
 *
 * Returns the local FILLER_DATABASE directly. The GitHub repo at
 * xsunzukz/anime-filler-episodes-api is a web scraper of animefillerlist.com
 * and does not expose a static JSON file. To fetch fresh filler data from
 * animefillerlist.com, run: npm run seed:filler
 */
export function getAllFillerData(): FillerEntry[] {
  return FILLER_DATABASE;
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
