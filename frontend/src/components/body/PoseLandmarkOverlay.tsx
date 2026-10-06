import React from "react";
import { Landmark, POSE_CONNECTIONS } from "../../services/pose/poseProvider";

interface PoseLandmarkOverlayProps {
  landmarks: Landmark[];
  isMirrored?: boolean;
  visible?: boolean;
  videoWidth?: number;
  videoHeight?: number;
}

export const PoseLandmarkOverlay: React.FC<PoseLandmarkOverlayProps> = ({
  landmarks,
  isMirrored = false,
  visible = true,
}) => {
  if (!visible || !landmarks || landmarks.length === 0) {
    return null;
  }

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
        isMirrored ? "scale-x-[-1]" : ""
      }`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="landmarkGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Skeletal Connections */}
      {POSE_CONNECTIONS.map(([idxA, idxB], i) => {
        const pA = landmarks[idxA];
        const pB = landmarks[idxB];
        if (!pA || !pB || (pA.visibility ?? 1) < 0.35 || (pB.visibility ?? 1) < 0.35) {
          return null;
        }

        return (
          <line
            key={`conn-${i}`}
            x1={pA.x * 100}
            y1={pA.y * 100}
            x2={pB.x * 100}
            y2={pB.y * 100}
            stroke="#10B981"
            strokeWidth="0.8"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
        );
      })}

      {/* Anatomical Landmark Points */}
      {landmarks.map((pt, i) => {
        if (!pt || (pt.visibility ?? 1) < 0.35) return null;
        const cx = pt.x * 100;
        const cy = pt.y * 100;
        const isKeyJoint = i === 11 || i === 12 || i === 13 || i === 14 || i === 15 || i === 16;

        return (
          <g key={`pt-${i}`}>
            <circle cx={cx} cy={cy} r={isKeyJoint ? 1.6 : 1.2} fill="#10B981" />
            <circle cx={cx} cy={cy} r={isKeyJoint ? 3.0 : 2.2} fill="url(#landmarkGlow)" />
          </g>
        );
      })}
    </svg>
  );
};
