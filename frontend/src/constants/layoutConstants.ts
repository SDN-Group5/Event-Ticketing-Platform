// Shared constants for 2D-3D coordinate mapping
// These constants ensure consistent positioning between the 2D layout editor and 3D venue viewer

// ============================================
// 2D LAYOUT EDITOR CONSTANTS
// ============================================

/** Size of each seat unit in pixels (includes seat + gap) for the 2D editor */
export const SEAT_UNIT_2D = 20; // 18px seat + 2px gap

// ============================================
// 3D CONVERSION
// ============================================

/** Scale factor to convert 2D pixel coordinates to 3D world units */
export const SCALE_FACTOR_3D = 0.08;

// ============================================
// 3D DERIVED CONSTANTS (calculated from 2D for consistency)
// ============================================

/** Horizontal spacing between seats in 3D (derived from 2D) */
export const SEAT_SPACING_3D = SEAT_UNIT_2D * SCALE_FACTOR_3D; // 1.44 units

/** Vertical spacing between rows in 3D (derived from 2D) */
export const ROW_SPACING_3D = SEAT_UNIT_2D * SCALE_FACTOR_3D; // 1.44 units

// ============================================
// 3D SEAT GEOMETRY
// ============================================

/** Width of seat mesh in 3D */
export const SEAT_WIDTH_3D = 1.3;

/** Depth of seat mesh in 3D */
export const SEAT_DEPTH_3D = 1.1;

/** Height of seat cushion in 3D */
export const SEAT_HEIGHT_3D = 0.2;

/** Height of seat backrest in 3D */
export const SEAT_BACK_HEIGHT_3D = 0.6;
