import { clamp, remap } from "./utils";
import { sdf } from "./lib";

export type GenerateSdfParams = {
  width: number;
};

export const getFilled = (imageData: Uint8Array) => {
  const filled: boolean[] = [];

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];

    const isFilled = (r + g + b) / 3 < 255 / 2;
    filled.push(isFilled);
  }

  return filled;
};

export const getDistances = (
  imageData: Uint8Array,
  params: GenerateSdfParams
) => {
  const filled = getFilled(imageData);
  return sdf(filled, params.width);
};

export const generateSdf = (
  imageData: Uint8Array,
  params: GenerateSdfParams
) => {
  const distances = getDistances(imageData, params);

  let maxValue = 0;
  let minValue = Infinity;

  for (const distance of distances) {
    if (distance > maxValue) maxValue = distance;
    if (distance < minValue) minValue = distance;
  }

  const newImageData = new Float32Array(distances.length * 4);

  for (let i = 0; i < distances.length; i += 4) {
    const distance = remap(distances[i / 4], minValue, maxValue, 0, 255);
    const clampedDistance = clamp(distance, 0, 255);

    newImageData[i] = clampedDistance;
    newImageData[i + 1] = clampedDistance;
    newImageData[i + 2] = clampedDistance;
    newImageData[i + 3] = 255;
  }

  return newImageData;
};
