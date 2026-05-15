export const EQUIPMENT = {
  head: [
    {
      id: 'leather_cap',
      name: 'Leather Cap',
      slot: 'head',
      type: 'armor',
      rarity: 'common',
      statBonuses: { con: 1 },
      svgPaths: [
        { d: 'M82 52 Q100 42 118 52 L120 68 L80 68 Z', fill: '#92400e' },
        { d: 'M82 65 L78 72 L82 75 L85 68 Z', fill: '#78350f' },
        { d: 'M118 65 L122 72 L118 75 L115 68 Z', fill: '#78350f' },
      ],
    },
    {
      id: 'iron_helm',
      name: 'Iron Helm',
      slot: 'head',
      type: 'armor',
      rarity: 'uncommon',
      statBonuses: { str: 1, con: 2 },
      svgPaths: [
        { d: 'M78 48 Q100 35 122 48 L125 65 L120 72 L118 70 L118 55 Q100 45 82 55 L82 70 L78 72 Z', fill: '#9ca3af' },
        { d: 'M85 55 L85 68 L115 68 L115 55', fill: 'none', stroke: '#6b7280', strokeWidth: '1' },
        { d: 'M96 42 L104 42 L102 50 L98 50 Z', fill: '#6b7280' },
      ],
    },
    {
      id: 'mage_hood',
      name: 'Mage Hood',
      slot: 'head',
      type: 'armor',
      rarity: 'common',
      statBonuses: { int: 1, wis: 1 },
      svgPaths: [
        { d: 'M80 55 Q100 35 120 55 L122 75 L115 78 L112 65 Q100 50 88 65 L85 78 L78 75 Z', fill: '#4f46e5' },
        { d: 'M85 60 Q100 45 115 60', fill: 'none', stroke: '#6366f1', strokeWidth: '1' },
      ],
    },
    {
      id: 'crown',
      name: 'Silver Crown',
      slot: 'head',
      type: 'accessory',
      rarity: 'rare',
      statBonuses: { wis: 2, cha: 2 },
      svgPaths: [
        { d: 'M85 50 L88 38 L93 46 L100 35 L107 46 L112 38 L115 50 Z', fill: '#e5e7eb' },
        { d: 'M85 50 L115 50 L113 55 L87 55 Z', fill: '#d1d5db' },
        { cx: '90', cy: '45', r: '1.5', fill: '#3b82f6' },
        { cx: '100', cy: '38', r: '1.5', fill: '#ef4444' },
        { cx: '110', cy: '45', r: '1.5', fill: '#22c55e' },
      ],
    },
    {
      id: 'orc_helm',
      name: 'Orc War Helm',
      slot: 'head',
      type: 'armor',
      rarity: 'uncommon',
      statBonuses: { str: 2, con: 1 },
      svgPaths: [
        { d: 'M75 50 Q100 38 125 50 L128 68 L120 72 L118 65 L118 55 Q100 45 82 55 L82 65 L75 68 Z', fill: '#4b5563' },
        { d: 'M72 55 L68 50 L74 58 Z', fill: '#374151' },
        { d: 'M128 55 L132 50 L126 58 Z', fill: '#374151' },
        { d: 'M95 65 L100 75 L105 65 Z', fill: '#6b7280' },
      ],
    },
  ],

  chest: [
    {
      id: 'leather_vest',
      name: 'Leather Vest',
      slot: 'chest',
      type: 'armor',
      rarity: 'common',
      statBonuses: { dex: 1, con: 1 },
      svgPaths: [
        { d: 'M72 168 L128 168 L132 220 L68 220 Z', fill: '#92400e' },
        { d: 'M90 168 L90 220', fill: 'none', stroke: '#78350f', strokeWidth: '1' },
        { d: 'M100 168 L100 220', fill: 'none', stroke: '#78350f', strokeWidth: '1' },
        { d: 'M110 168 L110 220', fill: 'none', stroke: '#78350f', strokeWidth: '1' },
      ],
    },
    {
      id: 'chain_mail',
      name: 'Chain Mail',
      slot: 'chest',
      type: 'armor',
      rarity: 'uncommon',
      statBonuses: { dex: 1, con: 2, str: 1 },
      svgPaths: [
        { d: 'M68 165 L132 165 L136 225 L64 225 Z', fill: '#9ca3af' },
        { d: 'M75 175 L75 215 M85 175 L85 215 M95 175 L95 215 M105 175 L105 215 M115 175 L115 215 M125 175 L125 215', fill: 'none', stroke: '#6b7280', strokeWidth: '0.8' },
        { d: 'M75 185 L125 185 M75 195 L125 195 M75 205 L125 205', fill: 'none', stroke: '#6b7280', strokeWidth: '0.8' },
      ],
    },
    {
      id: 'iron_plate',
      name: 'Iron Plate',
      slot: 'chest',
      type: 'armor',
      rarity: 'rare',
      statBonuses: { str: 3, con: 3 },
      svgPaths: [
        { d: 'M64 162 L136 162 L140 230 L60 230 Z', fill: '#d4d4d8' },
        { d: 'M70 168 L130 168 L133 225 L67 225 Z', fill: '#e5e7eb' },
        { d: 'M85 168 L85 225 M115 168 L115 225', fill: 'none', stroke: '#a1a1aa', strokeWidth: '1' },
        { d: 'M95 175 L105 175 L105 218 L95 218 Z', fill: '#a1a1aa' },
        { d: 'M72 172 L80 168 L82 175 L74 179 Z', fill: '#9ca3af' },
        { d: 'M128 172 L120 168 L118 175 L126 179 Z', fill: '#9ca3af' },
      ],
    },
    {
      id: 'mage_robe',
      name: 'Mage Robe',
      slot: 'chest',
      type: 'armor',
      rarity: 'uncommon',
      statBonuses: { int: 2, wis: 2 },
      svgPaths: [
        { d: 'M68 170 L132 170 L140 260 L60 260 Z', fill: '#4f46e5' },
        { d: 'M80 170 L80 260', fill: 'none', stroke: '#6366f1', strokeWidth: '1' },
        { d: 'M100 170 L100 260', fill: 'none', stroke: '#6366f1', strokeWidth: '1' },
        { d: 'M120 170 L120 260', fill: 'none', stroke: '#6366f1', strokeWidth: '1' },
        { d: 'M95 180 L105 180 L105 210 L95 210 Z', fill: '#818cf8' },
      ],
    },
    {
      id: 'ranger_cloak',
      name: 'Ranger Cloak',
      slot: 'chest',
      type: 'armor',
      rarity: 'common',
      statBonuses: { dex: 2, wis: 1 },
      svgPaths: [
        { d: 'M65 170 L135 170 L142 260 L58 260 Z', fill: '#166534' },
        { d: 'M75 175 L125 175 L128 230 L72 230 Z', fill: '#15803d' },
        { d: 'M90 200 Q100 195 110 200', fill: 'none', stroke: '#22c55e', strokeWidth: '1.5' },
        { d: 'M95 210 Q100 205 105 210', fill: 'none', stroke: '#22c55e', strokeWidth: '1' },
      ],
    },
    {
      id: 'paladin_armor',
      name: 'Paladin Armor',
      slot: 'chest',
      type: 'armor',
      rarity: 'epic',
      statBonuses: { str: 3, cha: 2, con: 2 },
      svgPaths: [
        { d: 'M62 160 L138 160 L142 235 L58 235 Z', fill: '#e5e7eb' },
        { d: 'M68 165 L132 165 L135 230 L65 230 Z', fill: '#f3f4f6' },
        { d: 'M95 170 L105 170 L105 225 L95 225 Z', fill: '#fbbf24' },
        { d: 'M97 175 L103 175 L103 220 L97 220 Z', fill: '#f59e0b' },
        { d: 'M75 170 L82 165 L84 172 L77 177 Z', fill: '#d4d4d8' },
        { d: 'M125 170 L118 165 L116 172 L123 177 Z', fill: '#d4d4d8' },
      ],
    },
  ],

  pants: [
    {
      id: 'leather_trousers',
      name: 'Leather Trousers',
      slot: 'pants',
      type: 'armor',
      rarity: 'common',
      statBonuses: { dex: 1 },
      svgPaths: [
        { d: 'M75 225 L85 225 L82 270 L72 270 Z', fill: '#92400e' },
        { d: 'M115 225 L125 225 L128 270 L118 270 Z', fill: '#92400e' },
        { d: 'M85 225 L115 225 L115 235 L85 235 Z', fill: '#78350f' },
      ],
    },
    {
      id: 'iron_leggings',
      name: 'Iron Leggings',
      slot: 'pants',
      type: 'armor',
      rarity: 'uncommon',
      statBonuses: { str: 1, con: 2 },
      svgPaths: [
        { d: 'M72 225 L85 225 L82 270 L70 270 Z', fill: '#9ca3af' },
        { d: 'M115 225 L128 225 L130 270 L118 270 Z', fill: '#9ca3af' },
        { d: 'M85 225 L115 225 L115 232 L85 232 Z', fill: '#6b7280' },
        { d: 'M78 240 L80 238 L80 260 L78 262 Z', fill: '#6b7280' },
        { d: 'M122 240 L120 238 L120 260 L122 262 Z', fill: '#6b7280' },
      ],
    },
    {
      id: 'mage_leggings',
      name: 'Mage Leggings',
      slot: 'pants',
      type: 'armor',
      rarity: 'common',
      statBonuses: { int: 1 },
      svgPaths: [
        { d: 'M78 225 L88 225 L85 270 L75 270 Z', fill: '#4f46e5' },
        { d: 'M112 225 L122 225 L125 270 L115 270 Z', fill: '#4f46e5' },
        { d: 'M88 225 L112 225 L112 235 L88 235 Z', fill: '#6366f1' },
      ],
    },
    {
      id: 'ranger_pants',
      name: 'Ranger Pants',
      slot: 'pants',
      type: 'armor',
      rarity: 'common',
      statBonuses: { dex: 1, wis: 1 },
      svgPaths: [
        { d: 'M74 225 L86 225 L83 270 L72 270 Z', fill: '#166534' },
        { d: 'M114 225 L126 225 L128 270 L116 270 Z', fill: '#166534' },
        { d: 'M86 225 L114 225 L114 233 L86 233 Z', fill: '#15803d' },
      ],
    },
  ],

  boots: [
    {
      id: 'leather_boots',
      name: 'Leather Boots',
      slot: 'boots',
      type: 'armor',
      rarity: 'common',
      statBonuses: { dex: 1 },
      svgPaths: [
        { d: 'M72 268 L85 268 L85 282 L70 282 Z', fill: '#92400e' },
        { d: 'M115 268 L128 268 L130 282 L115 282 Z', fill: '#92400e' },
        { d: 'M72 268 L85 268 L84 272 L73 272 Z', fill: '#78350f' },
        { d: 'M115 268 L128 268 L127 272 L116 272 Z', fill: '#78350f' },
      ],
    },
    {
      id: 'iron_greaves',
      name: 'Iron Greaves',
      slot: 'boots',
      type: 'armor',
      rarity: 'uncommon',
      statBonuses: { con: 2 },
      svgPaths: [
        { d: 'M70 266 L86 266 L86 284 L68 284 Z', fill: '#9ca3af' },
        { d: 'M114 266 L130 266 L132 284 L114 284 Z', fill: '#9ca3af' },
        { d: 'M74 270 L82 268 L82 280 L74 282 Z', fill: '#6b7280' },
        { d: 'M118 270 L126 268 L126 280 L118 282 Z', fill: '#6b7280' },
      ],
    },
    {
      id: 'mage_sandals',
      name: 'Mage Sandals',
      slot: 'boots',
      type: 'armor',
      rarity: 'common',
      statBonuses: { wis: 1 },
      svgPaths: [
        { d: 'M74 270 L82 270 L82 280 L74 280 Z', fill: '#4f46e5' },
        { d: 'M118 270 L126 270 L126 280 L118 280 Z', fill: '#4f46e5' },
        { d: 'M76 268 L80 268', fill: 'none', stroke: '#6366f1', strokeWidth: '1.5' },
        { d: 'M120 268 L124 268', fill: 'none', stroke: '#6366f1', strokeWidth: '1.5' },
      ],
    },
    {
      id: 'ranger_boots',
      name: 'Ranger Boots',
      slot: 'boots',
      type: 'armor',
      rarity: 'common',
      statBonuses: { dex: 2 },
      svgPaths: [
        { d: 'M70 266 L86 266 L86 284 L68 284 Z', fill: '#166534' },
        { d: 'M114 266 L130 266 L132 284 L114 284 Z', fill: '#166534' },
        { d: 'M72 266 L84 266 L83 270 L73 270 Z', fill: '#15803d' },
        { d: 'M116 266 L128 266 L127 270 L117 270 Z', fill: '#15803d' },
      ],
    },
  ],

  rightHand: [
    {
      id: 'longsword',
      name: 'Longsword',
      slot: 'rightHand',
      type: 'weapon',
      rarity: 'common',
      statBonuses: { str: 2 },
      svgPaths: [
        { d: 'M142 170 L146 170 L146 230 L142 230 Z', fill: '#d4d4d8' },
        { d: 'M140 165 L148 165 L148 170 L140 170 Z', fill: '#92400e' },
        { d: 'M143 230 L145 230 L145 245 L143 245 Z', fill: '#6b7280' },
      ],
    },
    {
      id: 'battleaxe',
      name: 'Battleaxe',
      slot: 'rightHand',
      type: 'weapon',
      rarity: 'uncommon',
      statBonuses: { str: 3 },
      svgPaths: [
        { d: 'M144 165 L148 165 L148 240 L144 240 Z', fill: '#92400e' },
        { d: 'M138 165 Q130 170 135 180 L142 175 Z', fill: '#9ca3af' },
        { d: 'M148 165 Q156 170 152 180 L145 175 Z', fill: '#9ca3af' },
      ],
    },
    {
      id: 'fire_staff',
      name: 'Fire Staff',
      slot: 'rightHand',
      type: 'weapon',
      rarity: 'rare',
      statBonuses: { int: 2, wis: 2 },
      svgPaths: [
        { d: 'M152 140 L156 140 L156 250 L152 250 Z', fill: '#92400e' },
        { d: 'M148 130 Q154 120 160 130 Q154 140 148 130 Z', fill: '#ef4444' },
        { d: 'M150 128 Q154 122 158 128 Q154 134 150 128 Z', fill: '#fbbf24' },
        { d: 'M152 126 Q154 120 156 126 Q154 130 152 126 Z', fill: '#fff' },
      ],
    },
    {
      id: 'dagger',
      name: 'Dagger',
      slot: 'rightHand',
      type: 'weapon',
      rarity: 'common',
      statBonuses: { dex: 2 },
      svgPaths: [
        { d: 'M143 185 L145 185 L145 220 L143 220 Z', fill: '#d4d4d8' },
        { d: 'M141 180 L147 180 L147 185 L141 185 Z', fill: '#92400e' },
      ],
    },
    {
      id: 'long_bow',
      name: 'Long Bow',
      slot: 'rightHand',
      type: 'weapon',
      rarity: 'uncommon',
      statBonuses: { dex: 2, wis: 1 },
      svgPaths: [
        { d: 'M155 155 Q165 175 155 195', fill: 'none', stroke: '#92400e', strokeWidth: '3' },
        { d: 'M155 160 L155 190', fill: 'none', stroke: '#d4d4d8', strokeWidth: '0.5' },
        { d: 'M152 175 L155 175 L155 177 L152 177 Z', fill: '#92400e' },
      ],
    },
    {
      id: 'holy_mace',
      name: 'Holy Mace',
      slot: 'rightHand',
      type: 'weapon',
      rarity: 'rare',
      statBonuses: { wis: 2, cha: 2, str: 1 },
      svgPaths: [
        { d: 'M144 165 L148 165 L148 235 L144 235 Z', fill: '#92400e' },
        { d: 'M140 155 Q146 148 152 155 L152 165 L140 165 Z', fill: '#fbbf24' },
        { d: 'M146 148 L146 155', fill: 'none', stroke: '#f59e0b', strokeWidth: '1' },
        { d: 'M143 152 L149 152', fill: 'none', stroke: '#f59e0b', strokeWidth: '1' },
      ],
    },
  ],

  leftHand: [
    {
      id: 'tower_shield',
      name: 'Tower Shield',
      slot: 'leftHand',
      type: 'armor',
      rarity: 'uncommon',
      statBonuses: { con: 3 },
      svgPaths: [
        { d: 'M42 175 L58 175 L60 240 L40 240 Z', fill: '#3b82f6' },
        { d: 'M44 178 L56 178 L58 238 L42 238 Z', fill: '#60a5fa' },
        { d: 'M48 190 L52 190 L52 225 L48 225 Z', fill: '#fbbf24' },
        { d: 'M50 195 L50 220', fill: 'none', stroke: '#f59e0b', strokeWidth: '1.5' },
        { d: 'M46 205 L54 205', fill: 'none', stroke: '#f59e0b', strokeWidth: '1.5' },
      ],
    },
    {
      id: 'tome',
      name: 'Arcane Tome',
      slot: 'leftHand',
      type: 'accessory',
      rarity: 'uncommon',
      statBonuses: { int: 2, wis: 1 },
      svgPaths: [
        { d: 'M42 180 L56 180 L56 210 L42 210 Z', fill: '#7c3aed' },
        { d: 'M44 182 L54 182 L54 208 L44 208 Z', fill: '#fef3c7' },
        { d: 'M48 186 L50 186 L50 204 L48 204 Z', fill: '#4f46e5' },
        { d: 'M42 178 L56 178 L56 182 L42 182 Z', fill: '#fbbf24' },
      ],
    },
    {
      id: 'off_hand_dagger',
      name: 'Off-Hand Dagger',
      slot: 'leftHand',
      type: 'weapon',
      rarity: 'common',
      statBonuses: { dex: 1 },
      svgPaths: [
        { d: 'M43 185 L47 185 L47 215 L43 215 Z', fill: '#d4d4d8' },
        { d: 'M41 180 L49 180 L49 185 L41 185 Z', fill: '#374151' },
      ],
    },
    {
      id: 'holy_symbol',
      name: 'Holy Symbol',
      slot: 'leftHand',
      type: 'accessory',
      rarity: 'uncommon',
      statBonuses: { wis: 2, cha: 1 },
      svgPaths: [
        { d: 'M44 180 L54 180 L54 210 L44 210 Z', fill: '#fbbf24' },
        { d: 'M49 185 L49 205', fill: 'none', stroke: '#f59e0b', strokeWidth: '2' },
        { d: 'M46 193 L52 193', fill: 'none', stroke: '#f59e0b', strokeWidth: '2' },
      ],
    },
  ],

  accessory1: [
    {
      id: 'ring_strength',
      name: 'Ring of Strength',
      slot: 'accessory1',
      type: 'accessory',
      rarity: 'rare',
      statBonuses: { str: 3 },
      svgPaths: [
        { d: 'M88 168 Q100 162 112 168 Q110 175 100 173 Q90 175 88 168 Z', fill: '#fbbf24' },
        { d: 'M95 167 Q100 164 105 167 Q103 171 100 170 Q97 171 95 167 Z', fill: '#ef4444' },
      ],
    },
    {
      id: 'amulet_wisdom',
      name: 'Amulet of Wisdom',
      slot: 'accessory1',
      type: 'accessory',
      rarity: 'rare',
      statBonuses: { wis: 3 },
      svgPaths: [
        { d: 'M96 158 L104 158 L104 162 L96 162 Z', fill: '#fbbf24' },
        { d: 'M98 162 L102 162 L102 172 L98 172 Z', fill: '#4f46e5' },
        { d: 'M99 164 L101 164 L101 170 L99 170 Z', fill: '#818cf8' },
      ],
    },
    {
      id: 'cloak_shadows',
      name: 'Cloak of Shadows',
      slot: 'accessory1',
      type: 'accessory',
      rarity: 'epic',
      statBonuses: { dex: 3, cha: 1 },
      svgPaths: [
        { d: 'M60 168 L70 165 L72 175 L62 178 Z', fill: '#1f2937' },
        { d: 'M130 168 L140 165 L138 175 L128 178 Z', fill: '#1f2937' },
        { d: 'M62 178 Q55 200 50 230 L55 232 Q60 200 65 180 Z', fill: '#111827' },
        { d: 'M138 178 Q145 200 150 230 L145 232 Q140 200 135 180 Z', fill: '#111827' },
      ],
    },
  ],

  accessory2: [
    {
      id: 'belt_giants',
      name: 'Belt of Giants',
      slot: 'accessory2',
      type: 'accessory',
      rarity: 'epic',
      statBonuses: { str: 4, con: 1 },
      svgPaths: [
        { d: 'M70 222 L130 222 L130 228 L70 228 Z', fill: '#92400e' },
        { d: 'M95 222 L105 222 L105 228 L95 228 Z', fill: '#fbbf24' },
        { d: 'M98 223 L102 223 L102 227 L98 227 Z', fill: '#f59e0b' },
      ],
    },
    {
      id: 'bracer_dexterity',
      name: 'Bracer of Dexterity',
      slot: 'accessory2',
      type: 'accessory',
      rarity: 'uncommon',
      statBonuses: { dex: 3 },
      svgPaths: [
        { d: 'M62 195 L68 193 L68 200 L62 202 Z', fill: '#d4d4d8' },
        { d: 'M132 195 L138 193 L138 200 L132 202 Z', fill: '#d4d4d8' },
      ],
    },
  ],

  accessory3: [
    {
      id: 'charm_luck',
      name: 'Charm of Luck',
      slot: 'accessory3',
      type: 'accessory',
      rarity: 'rare',
      statBonuses: { cha: 2, dex: 1 },
      svgPaths: [
        { d: 'M96 155 L104 155 L104 160 L96 160 Z', fill: '#22c55e' },
        { d: 'M98 160 L102 160 L102 168 L98 168 Z', fill: '#16a34a' },
        { cx: '100', cy: '162', r: '2', fill: '#bbf7d0' },
      ],
    },
    {
      id: 'talisman_warding',
      name: 'Talisman of Warding',
      slot: 'accessory3',
      type: 'accessory',
      rarity: 'uncommon',
      statBonuses: { con: 2, wis: 1 },
      svgPaths: [
        { d: 'M96 155 L104 155 L104 160 L96 160 Z', fill: '#e5e7eb' },
        { d: 'M98 160 L102 160 L102 168 L98 168 Z', fill: '#9ca3af' },
        { d: 'M100 162 L100 166', fill: 'none', stroke: '#6b7280', strokeWidth: '1' },
        { d: 'M98 164 L102 164', fill: 'none', stroke: '#6b7280', strokeWidth: '1' },
      ],
    },
  ],
};

export const SLOT_LABELS = {
  head: 'Head',
  chest: 'Chest',
  pants: 'Pants',
  boots: 'Boots',
  rightHand: 'Right Hand',
  leftHand: 'Left Hand',
  accessory1: 'Accessory 1',
  accessory2: 'Accessory 2',
  accessory3: 'Accessory 3',
};

export const SLOT_ORDER = ['head', 'chest', 'pants', 'boots', 'rightHand', 'leftHand', 'accessory1', 'accessory2', 'accessory3'];

export const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
};

export function getItemsBySlot(slot) {
  return EQUIPMENT[slot] || [];
}

export function getAllItems() {
  return Object.values(EQUIPMENT).flat();
}

export function getItemById(id) {
  return getAllItems().find(item => item.id === id);
}

export function getItemsByRarity(rarity) {
  return getAllItems().filter(item => item.rarity === rarity);
}

export function getItemsByType(type) {
  return getAllItems().filter(item => item.type === type);
}
