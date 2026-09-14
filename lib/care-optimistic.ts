import type { CareAction, CareState } from "./validation/care";
// A display-only patch. PostgreSQL supplies the confirmed arrival timestamp.
export function optimisticCare<T extends CareState>(state: T, action: CareAction, previewTime: string): T {
  if (action === "arrival") return { ...state, arrivalTime: state.arrivalTime ?? previewTime };
  if (!state.arrivalTime) return state;
  return { ...state, [action]: true };
}
