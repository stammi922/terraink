/**
 * Shield path generator for canvas clipping (RIMOWA-style sticker).
 *
 * Creates a heraldic shield shape with rounded top corners and
 * a pointed bottom, suitable for travel sticker exports.
 */
export function createShieldPath(width: number, height: number): Path2D {
  const path = new Path2D();
  const topRadius = width * 0.06;
  const midY = height * 0.65;

  // Start top-left corner
  path.moveTo(topRadius, 0);
  path.lineTo(width - topRadius, 0);
  path.quadraticCurveTo(width, 0, width, topRadius);
  path.lineTo(width, midY);
  path.quadraticCurveTo(width, height * 0.92, width * 0.5, height);
  path.quadraticCurveTo(0, height * 0.92, 0, midY);
  path.lineTo(0, topRadius);
  path.quadraticCurveTo(0, 0, topRadius, 0);
  path.closePath();

  return path;
}

/**
 * Generate SVG path data string for shield shape (for CSS clip-path).
 */
export function getShieldSvgPath(width: number, height: number): string {
  const topRadius = width * 0.06;
  const midY = height * 0.65;

  return `
    M ${topRadius} 0
    L ${width - topRadius} 0
    Q ${width} 0 ${width} ${topRadius}
    L ${width} ${midY}
    Q ${width} ${height * 0.92} ${width * 0.5} ${height}
    Q 0 ${height * 0.92} 0 ${midY}
    L 0 ${topRadius}
    Q 0 0 ${topRadius} 0
    Z
  `.trim();
}
