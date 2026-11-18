(() => {
  'use strict';

  const WIDTH = 1000;
  const HEIGHT = 760;
  const CACHE_SCALE = 1.5;
  let artwork;

  function randomFrom(seed) {
    return () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function paint(ctx) {
    const random = randomFrom(71);
    const ground = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    ground.addColorStop(0, '#f3ecdc');
    ground.addColorStop(.48, '#f7f0dc');
    ground.addColorStop(1, '#eee6d2');
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    function fill(path, color, edge = '', width = 1) {
      const shape = new Path2D(path);
      ctx.fillStyle = color;
      ctx.fill(shape);
      if (edge) {
        ctx.strokeStyle = edge;
        ctx.lineWidth = width;
        ctx.stroke(shape);
      }
      return shape;
    }

    function stroke(path, color, width, dash = []) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash(dash);
      ctx.stroke(new Path2D(path));
      ctx.setLineDash([]);
    }

    function ellipse(x, y, rx, ry, color, angle = 0) {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    const parkPath = 'M-38 279 C62 272 107 302 166 316 C232 332 249 281 321 272 C380 263 439 292 492 267 C560 233 579 201 626 223 C676 248 697 293 719 335 C737 375 729 428 708 460 C682 500 650 522 634 568 C615 625 657 665 714 700 L785 809 L-47 812 Z';
    const parkShade = ctx.createLinearGradient(72, 269, 603, 739);
    parkShade.addColorStop(0, '#e2e8c6');
    parkShade.addColorStop(.52, '#dce5c1');
    parkShade.addColorStop(1, '#cddab3');
    const park = fill(parkPath, parkShade, '#cbd8ad', 1.25);

    fill('M-30 328 C43 306 61 345 123 349 C186 350 207 332 251 344 C306 360 332 399 318 451 C294 514 191 531 132 511 C75 492 30 497 -31 534 Z', '#d5dfb6');
    fill('M449 652 C515 618 564 640 627 687 C653 706 672 729 714 769 L432 777 C395 724 395 684 449 652 Z', '#c8d6ad');
    fill('M864 -24 C818 34 782 63 803 115 C836 190 959 178 1033 151 L1032 -30 Z', '#e0e5c9');
    fill('M1011 439 C974 436 940 467 930 507 C914 552 950 601 1007 619 L1034 583 Z', '#dce4c2');

    function groundGrain() {
      for (let i = 0; i < 11800; i++) {
        const x = random() * WIDTH;
        const y = random() * HEIGHT;
        const onGrass = ctx.isPointInPath(park, x * CACHE_SCALE, y * CACHE_SCALE);
        const opacity = random() * (onGrass ? .125 : .087);
        const wear = random() > .42;
        ctx.fillStyle = wear ? 'rgba(85,89,52,' + opacity + ')' : 'rgba(255,254,243,' + (opacity * 2.1) + ')';
        ctx.fillRect(x, y, .55 + random() * 1.1, .55 + random() * 1.1);
      }
    }
    groundGrain();

    const streamPath = 'M760 -29 C723 45 736 92 758 147 C783 209 740 243 727 291 C711 354 752 376 754 427 C756 479 706 506 697 553 C686 608 737 642 764 686 C786 722 779 751 763 788';
    stroke(streamPath, '#c7d4b4', 65);
    stroke(streamPath, '#afcbd0', 48);
    stroke(streamPath, '#abd1d5', 42);
    stroke('M752 -15 C731 53 748 104 766 153 S747 255 738 291 C725 341 760 382 762 426 S720 507 710 555 C696 603 751 642 773 688 C789 721 787 751 774 774', 'rgba(240,252,240,.46)', 1.55);

    const waterStrokes = [
      [750, 24, 13, 11], [747, 76, 7, 11], [762, 132, 10, 11], [762, 173, 12, -3],
      [751, 215, 9, 9], [736, 271, 8, -10], [735, 330, 13, 7], [743, 367, 8, 12],
      [744, 423, 15, 9], [739, 473, 12, -10], [714, 521, 10, -8], [703, 563, 8, 7],
      [707, 600, 9, 8], [738, 639, 10, 13], [759, 684, 11, 9], [773, 739, 8, 11]
    ];
    waterStrokes.forEach(([x, y, dx, dy]) => {
      stroke('M' + x + ' ' + y + ' q' + (dx / 2) + ' ' + (dy / 2 - 3) + ' ' + dx + ' ' + dy, 'rgba(241,253,244,.64)', 1.1);
    });

    const roads = [
      ['M-45 178 C98 180 129 187 214 164 C291 143 390 169 438 192 C497 220 517 258 579 268 C648 278 676 263 708 272 C759 287 783 328 815 341 C879 365 916 351 1045 345', 31],
      ['M195 -34 C193 35 212 65 218 104 C223 130 217 149 212 166 C195 215 181 238 164 263 C144 293 116 305 69 322 C31 336 5 342 -30 341', 23],
      ['M427 -40 C420 24 403 51 397 94 C391 134 399 171 438 191', 22],
      ['M600 -38 C594 19 609 48 622 82 C637 126 616 157 610 187 C603 223 612 252 633 270', 21],
      ['M902 -42 C922 41 924 98 901 145 C873 196 858 263 874 306 C890 351 950 394 960 458 C968 513 945 597 973 648 C992 686 1012 713 1030 725', 29],
      ['M794 101 C830 119 869 130 909 126 C960 122 1006 102 1039 82', 17],
      ['M-40 639 C75 625 141 632 203 684 C250 723 280 756 340 783', 26],
      ['M669 765 C729 751 780 719 814 672 C856 616 871 569 871 518 C872 471 858 407 887 356', 24],
      ['M810 670 C866 654 915 648 975 654 C1008 657 1029 660 1055 657', 19]
    ];
    roads.forEach(([path, width]) => stroke(path, '#dfd5b8', width + 6));
    roads.forEach(([path, width]) => stroke(path, '#fff9e9', width));
    roads.forEach(([path, width]) => {
      if (width > 23) stroke(path, 'rgba(212,190,154,.46)', 1.35, [4, 8]);
    });

    const trails = [
      ['M161 265 C173 309 216 324 258 326 C314 328 342 335 385 358 C426 383 441 428 488 456 C529 481 567 479 609 454 C653 428 676 378 668 337 C661 306 643 291 632 274', 13],
      ['M-17 534 C82 513 139 523 192 544 C234 560 281 550 317 523 C350 498 355 462 388 447 C425 431 459 443 490 460', 12],
      ['M205 685 C229 647 279 632 327 635 C371 639 411 662 453 646 C501 626 524 577 568 561 C620 541 647 550 706 569 C755 583 823 575 871 517', 14],
      ['M316 522 C327 568 323 603 328 636', 9],
      ['M609 454 C637 502 600 524 568 561', 10],
      ['M640 279 C677 265 700 240 705 206 C709 167 691 147 695 120', 8],
      ['M106 528 C89 573 77 597 65 633', 9]
    ];
    trails.forEach(([path, width]) => {
      stroke(path, 'rgba(142,151,100,.23)', width + 4);
      stroke(path, '#f8efd6', width);
      stroke(path, 'rgba(204,184,144,.58)', 1.2, [2, 5]);
    });

    const pondPath = 'M119 427 C105 402 129 371 168 369 C191 367 225 356 258 370 C285 382 304 399 300 421 C294 445 268 467 239 471 C207 475 191 461 161 463 C135 465 120 452 119 427 Z';
    const pond = ctx.createLinearGradient(111, 370, 287, 466);
    pond.addColorStop(0, '#b0d6d5');
    pond.addColorStop(.52, '#acd0d3');
    pond.addColorStop(1, '#90bbc6');
    stroke(pondPath, '#c9d4a9', 17);
    stroke(pondPath, '#e0e8bf', 10);
    fill(pondPath, pond, '#a4c0b9', 1.2);
    stroke('M130 424 C120 402 144 384 170 382 C212 378 226 368 256 380 C275 387 289 400 292 414', 'rgba(243,254,237,.67)', 1.6);
    stroke('M144 450 C165 455 176 448 199 454 C229 465 249 455 264 452', 'rgba(237,249,227,.49)', 1.55);
    [[168, 399], [202, 419], [225, 391], [259, 418], [149, 432], [237, 434], [275, 405]].forEach(([x, y]) => {
      stroke('M' + x + ' ' + y + ' q7 -2 13 0 m-9 4 q4 -1 9 0', 'rgba(242,253,238,.58)', 1.1);
    });
    [[154, 417], [169, 429], [263, 429], [256, 438], [189, 390]].forEach(([x, y], index) => {
      ellipse(x, y, 5, 2.65, index % 2 ? '#7ca397' : '#8eaf98', -.4);
      stroke('M' + (x - 1) + ' ' + y + ' l3 -1', '#cde0ae', .55);
      if (index % 2 === 0) ellipse(x - 1, y - 1.5, 1.7, 1.2, '#f5c3bd');
    });

    function bridge(x, y, angle, length, width) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.lineJoin = 'round';
      ctx.fillStyle = 'rgba(111,101,70,.18)';
      ctx.fillRect(-length/2 + 2, -width/2 + 4, length, width + 2);
      ctx.fillStyle = '#e7c89f';
      ctx.strokeStyle = '#b59671';
      ctx.lineWidth = 1.65;
      ctx.fillRect(-length/2, -width/2, length, width);
      ctx.strokeRect(-length/2, -width/2, length, width);
      for (let i = -length/2 + 5; i < length/2; i += 5) {
        ctx.fillStyle = 'rgba(143,106,78,.28)';
        ctx.fillRect(i, -width/2, .8, width);
      }
      ctx.fillStyle = '#ba9771';
      ctx.fillRect(-length/2 - 1.5, -width/2 - .5, length + 3, 2);
      ctx.fillRect(-length/2 - 1.5, width/2 - 1.5, length + 3, 2);
      for (const xOffset of [-length/2 + 2, 0, length/2 - 2]) {
        ellipse(xOffset, -width/2, 2.25, 2.25, '#a57e61');
        ellipse(xOffset, width/2, 2.25, 2.25, '#a57e61');
      }
      ctx.restore();
    }
    bridge(726, 281, .36, 57, 25);
    bridge(701, 568, .28, 58, 15);
    bridge(778, 717, -.47, 57, 22);

    const palettes = {
      clay: ['#c67c61', '#a2604f', '#dc9779', '#f3d6b5', '#d6ad89', '#785f4f'],
      salmon: ['#d49283', '#ae7268', '#e5a497', '#f8dbbe', '#d9ab8f', '#82695c'],
      gold: ['#d4a267', '#b58452', '#edbc82', '#f4e3bc', '#d6bb91', '#88694f'],
      teal: ['#83a69a', '#608b82', '#a6bca8', '#f0e1bb', '#c7b093', '#5f7569'],
      lilac: ['#a69bae', '#86738c', '#c5b5c8', '#f0d9c9', '#d7b4a6', '#7a6378']
    };

    function house(x, y, width, depth, angle, palette, special = '') {
      const [roof, roofShadow, roofLight, wall, wallShadow, trim] = palettes[palette];
      const inset = width * .15;
      const wallHeight = 12 + width * .07;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      fill('M' + (-width/2 + 2) + ' ' + (-depth/2 + 7) + ' H' + (width/2 + 12) + ' L' + (width/2 + 18) + ' ' + (depth/2 + wallHeight + 9) + ' H' + (-width/2 + 7) + ' Z', 'rgba(103,85,53,.15)');
      ctx.fillStyle = '#f9efd5';
      ctx.fillRect(-width/2 + 1, depth/2 + wallHeight - 1, width + 4, 6);
      fill('M' + (-width/2) + ' ' + (depth/2 - 7) + ' H' + (width/2) + ' V' + (depth/2 + wallHeight) + ' H' + (-width/2) + ' Z', wall, wallShadow);
      ctx.fillStyle = wallShadow;
      ctx.fillRect(width/2 - 8, depth/2 + 2, 8, wallHeight - 2);

      fill('M' + (-width/2 - 5) + ' ' + (-depth/2) + ' L' + (-width/2 + inset) + ' ' + (-depth/2 - 8) + ' H' + (width/2 - inset - 2) + ' L' + (width/2 + 5) + ' ' + (-depth/2) + ' L' + (width/2 + 6) + ' ' + (depth/2 + 3) + ' H' + (-width/2 - 6) + ' Z', roof, roofShadow, 1.45);
      fill('M' + (-width/2 + inset) + ' ' + (-depth/2 - 8) + ' H' + (width/2 - inset - 2) + ' L' + (width/2 + 5) + ' ' + (-depth/2) + ' L' + (width/2 - inset) + ' -3 H' + (-width/2 + inset) + ' L' + (-width/2 - 5) + ' ' + (-depth/2) + ' Z', roofLight);
      fill('M' + (width/2 - inset) + ' -3 L' + (width/2 + 5) + ' ' + (-depth/2) + ' L' + (width/2 + 6) + ' ' + (depth/2 + 3) + ' Z', roofShadow);
      stroke('M' + (-width/2 + inset) + ' -3 H' + (width/2 - inset), roofShadow, 1.5);
      for (let offset = 2; offset < depth/2 + 1; offset += 5) {
        stroke('M' + (-width/2 - 2) + ' ' + offset + ' H' + (width/2 - inset + offset / 3), roofLight, .58);
      }
      if (width > 50) {
        ctx.fillStyle = roofShadow;
        ctx.fillRect(-width/2 + 12, -depth/2 - 8, 8, 11);
        ctx.fillStyle = wall;
        ctx.fillRect(-width/2 + 11, -depth/2 - 9, 10, 3);
      }
      const windows = width > 48 ? [-width/2 + 10, width/2 - 16] : [-width/2 + 7];
      windows.forEach(wx => {
        ctx.fillStyle = '#fbf1d4';
        ctx.fillRect(wx - 1, depth/2 + 4, 8, 7);
        ctx.fillStyle = trim;
        ctx.fillRect(wx, depth/2 + 5, 6, 5);
        ctx.fillStyle = '#f6e4c3';
        ctx.fillRect(wx + 2.5, depth/2 + 5, 1, 5);
      });
      ctx.fillStyle = trim;
      ctx.fillRect(-3, depth/2 + 6, 6, wallHeight - 6);

      if (special === 'awning') {
        const awningWidth = width * .55;
        const stripeWidth = awningWidth / 8;
        for (let number = 0; number < 8; number++) {
          ctx.fillStyle = number % 2 ? '#f6e1c0' : '#cf8b72';
          ctx.fillRect(-awningWidth / 2 + stripeWidth * number, depth/2 + 1, stripeWidth + .1, 7);
        }
        stroke('M' + (-awningWidth/2) + ' ' + (depth/2 + 8) + ' H' + (awningWidth/2), '#b9826a', .7);
      }
      ctx.restore();
    }

    const homes = [
      [30,111,62,39,-.12,'salmon'], [112,125,48,36,.13,'gold'], [150,55,55,31,-.21,'teal'], [45,20,49,31,.2,'gold'], [281,105,64,41,.05,'clay'], [338,67,42,33,-.17,'salmon'],
      [461,112,66,41,.18,'gold','awning'], [527,142,60,36,.16,'clay'], [503,49,44,29,.04,'lilac'], [550,7,61,40,.06,'salmon'], [662,69,65,37,.13,'salmon'],
      [78,236,57,40,-.17,'gold','awning'], [126,222,34,28,-.15,'clay'], [260,224,52,35,-.09,'clay','awning'], [328,229,46,35,.02,'salmon'], [456,259,49,30,.25,'teal'],
      [809,66,42,32,.14,'gold'], [856,79,43,31,.24,'clay'], [975,52,60,37,-.13,'lilac'], [843,177,52,34,-.22,'salmon'], [808,225,45,34,.09,'gold'],
      [948,202,61,38,-.2,'clay'], [1001,245,55,33,.14,'salmon'], [934,290,45,32,-.1,'gold'], [809,370,52,34,-.18,'salmon','awning'],
      [905,465,38,31,.05,'gold'], [920,530,44,29,-.14,'clay'], [908,590,54,36,.17,'salmon'], [982,575,51,38,-.14,'teal'],
      [837,716,56,40,-.4,'gold'], [911,720,64,37,.07,'salmon'], [968,741,48,35,-.12,'clay'],
      [42,707,62,36,-.11,'clay'], [117,727,55,36,.26,'teal'], [181,759,57,35,.37,'gold']
    ];
    homes.forEach(home => house(...home));

    function tree(x, y, size, kind) {
      const palettes = [
        ['#829e74', '#a5b788', '#beca9b'],
        ['#9eaf79', '#b3bf88', '#c8d29e'],
        ['#75977e', '#8dad89', '#abc296'],
        ['#b0ad7a', '#c4bc87', '#d0c596'],
        ['#a5a981', '#d0b09a', '#e2bfaa']
      ];
      const [shadow, canopy, sun] = palettes[kind % palettes.length];
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(size, size);
      ellipse(6, 5, 14, 7, 'rgba(96,103,68,.13)', -.2);
      ellipse(1, 2, 1.8, 6, '#92795c', -.06);
      ellipse(-4, -6, 10, 10.5, shadow);
      ellipse(6, -8, 10.5, 11, shadow);
      ellipse(0, -16, 10, 10.5, canopy);
      ellipse(-6, -11, 8, 9, canopy, -.16);
      ellipse(5, -11, 8, 9, canopy, .24);
      ellipse(-3, -17, 5.5, 3.6, sun, -.42);
      ellipse(-8, -11, 3, 1.8, sun, -.48);
      for (let i = 0; i < 5; i++) {
        const u = random() * 15 - 7.5;
        const v = random() * 12 - 18;
        ellipse(u, v, .8, .6, 'rgba(245,243,205,.55)');
      }
      ctx.restore();
    }

    const trees = [
      [10,34,1.2,2], [84,51,.8,4], [99,39,1,4], [175,126,.85,1], [244,44,1.2,2], [266,48,.85,1], [303,38,.72,2],
      [364,127,.98,2], [375,114,.78,1], [455,37,.72,3], [566,80,1.12,1], [684,22,1.15,1], [714,36,1.24,2],
      [807,37,1.1,1], [831,26,.85,2], [872,26,1.03,2], [851,41,.76,1], [952,24,.81,3], [988,102,1.18,2],
      [20,248,.91,3], [41,259,1.2,1], [102,280,.88,3], [190,210,.78,4], [303,196,.7,1], [361,220,.98,2],
      [477,217,.78,4], [547,214,1.14,1], [568,221,.93,2], [603,165,.79,1], [646,147,1.02,3], [668,133,.85,1], [707,125,1.28,2],
      [786,163,.9,2], [800,150,.73,1], [858,234,1.04,1], [967,162,.84,4], [977,180,1.14,4], [992,317,.8,2],
      [53,356,1.6,2], [83,367,1.14,1], [26,381,1.35,2], [63,395,1.1,1], [76,422,.88,3],
      [101,462,1.23,2], [86,479,.88,1], [122,490,1.09,2], [147,497,.74,1], [280,489,1.37,2],
      [310,470,1.3,1], [328,483,.89,2], [273,351,.77,3], [301,365,1.1,1], [394,325,1.03,2], [417,318,.85,1], [441,354,1.31,2],
      [482,327,1.2,1], [511,308,1.25,2], [533,339,1.11,1], [547,365,.82,4], [579,318,1.37,2], [596,337,.85,1], [606,382,1.04,3],
      [646,396,1.1,2], [683,451,.99,1], [698,439,1.23,2], [702,415,.91,1], [696,339,.87,3], [694,320,.7,1],
      [398,531,1.02,1], [415,553,1.14,2], [438,526,1.1,2], [471,544,1.07,3], [466,566,.92,1], [483,577,1.37,2], [503,558,.84,1],
      [601,587,1.2,2], [626,600,.83,1], [644,575,1.01,3], [665,591,1.26,2], [683,624,1.19,2], [701,647,.88,1],
      [819,416,.84,4], [838,433,1.05,1], [805,525,.91,1], [830,541,1.16,2], [811,556,.82,1], [783,583,.74,3], [815,601,1.02,2],
      [932,420,1.01,1], [969,485,1.45,2], [991,502,1.15,1], [977,531,.95,2], [954,615,1.01,1],
      [32,575,1.25,1], [52,563,.91,2], [101,588,1.2,2], [130,596,.9,3], [154,573,1.43,2], [172,584,.91,1],
      [248,599,1.31,2], [268,610,1.08,1], [287,586,.73,1], [344,578,1.04,2], [366,595,1.04,1], [390,615,.94,3], [373,623,.92,2],
      [222,720,1.19,2], [274,716,1.48,2], [302,703,.89,1], [317,748,1.19,2], [352,744,1.5,2], [384,715,1.24,1],
      [482,714,1.37,2], [510,720,1.21,1], [524,692,.84,3], [548,694,1.15,2], [590,717,1.27,2], [610,736,1.01,1], [660,713,1.16,2], [702,743,1.38,1]
    ];
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(item => tree(...item));

    function bench(x, y, angle) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ellipse(2, 3.5, 10, 3.3, 'rgba(91,81,50,.18)');
      ctx.fillStyle = '#9c7d5d';
      ctx.fillRect(-7.5, -3, 2, 8);
      ctx.fillRect(5.5, -3, 2, 8);
      ctx.fillStyle = '#c29872';
      ctx.fillRect(-9, -2.6, 18, 5);
      ctx.fillStyle = '#e5c396';
      ctx.fillRect(-9, -4.2, 18, 1.7);
      ctx.restore();
    }
    [[152,352,-.18], [309,418,1.19], [221,508,-.1], [379,414,.6], [541,448,-.15], [645,303,.71], [558,601,-.6], [293,651,.05], [686,653,1.03]].forEach(item => bench(...item));

    const tuftSpots = [
      [91,405,25], [119,379,17], [114,477,23], [293,450,17], [319,401,18], [265,505,28], [373,309,21],
      [438,373,20], [468,367,30], [543,335,25], [630,382,23], [660,349,17], [668,448,20],
      [473,506,23], [542,537,16], [635,546,16], [569,590,18], [644,628,25], [511,629,40],
      [196,580,22], [229,592,18], [285,679,29], [368,679,33], [420,703,27], [620,706,31],
      [815,485,16], [812,613,24], [987,469,16], [977,140,18], [680,108,18]
    ];
    tuftSpots.forEach(([cx, cy, radius], index) => {
      for (let i = 0; i < 8; i++) {
        const theta = random() * Math.PI * 2;
        const r = radius * Math.sqrt(random());
        const x = cx + Math.cos(theta) * r;
        const y = cy + Math.sin(theta) * r;
        const height = 1.9 + random() * 3;
        stroke('M' + (x - 2.75) + ' ' + (y - height * .7) + ' q2 .3 2.75 ' + (height * .7) + ' q.4 -' + height + ' 2.5 -' + height, 'rgba(126,151,105,.57)', .8);
        if (i < 3) {
          const color = index % 3 === 0 ? '#de9c96' : index % 3 === 1 ? '#ead0a3' : '#f8eccd';
          ellipse(x - 2.75, y - height, 1.2, 1.05, color);
          ellipse(x + 2.5, y - height - .2, 1.35, 1.2, color);
        }
      }
    });

    function label(text, x, y, size = 12, angle = 0, color = '#7c785c', tracking = 1.7) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.font = '700 ' + size + 'px Georgia, serif';
      ctx.lineJoin = 'round';
      const letters = [...text];
      const widths = letters.map(letter => ctx.measureText(letter).width + tracking);
      let offset = -(widths.reduce((total, width) => total + width, 0) - tracking) / 2;
      for (let i = 0; i < letters.length; i++) {
        ctx.lineWidth = 2.6;
        ctx.strokeStyle = 'rgba(251,247,225,.72)';
        ctx.strokeText(letters[i], offset, 0);
        ctx.fillStyle = color;
        ctx.fillText(letters[i], offset, 0);
        offset += widths[i];
      }
      ctx.restore();
    }
    label('MAPLE TERRACE', 303, 143, 10, -.04, '#8b795d', 1.3);
    label('BAKERY LANE', 115, 195, 9, -.04, '#8b795d', 1.15);
    label('PUDDING POND', 208, 479, 9, -.03, '#668e85', 1.25);
    label('MINT PARK', 510, 400, 17, -.14, '#6f815c', 2.4);
    label('SUNFLOWER ROW', 941, 381, 9, -.03, '#8b795d', 1.15);
    label('WILLOW WALK', 420, 675, 9, -.12, '#74845f', 1.15);

    const vignette = ctx.createRadialGradient(505, 365, 270, 505, 365, 710);
    vignette.addColorStop(0, 'rgba(125,104,66,0)');
    vignette.addColorStop(1, 'rgba(125,104,66,.11)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  window.drawManaMeowMap = function drawManaMeowMap(ctx) {
    if (!artwork) {
      artwork = document.createElement('canvas');
      artwork.width = WIDTH * CACHE_SCALE;
      artwork.height = HEIGHT * CACHE_SCALE;
      const artworkContext = artwork.getContext('2d');
      artworkContext.scale(CACHE_SCALE, CACHE_SCALE);
      paint(artworkContext);
    }
    ctx.drawImage(artwork, 0, 0, WIDTH, HEIGHT);
  };
})();
