// Pure JS (no JSX)
export const defaultVehicle = {
  climate: { on: true, temp: 21 },
  media: { on: true, volume: 40 },
  lights: { on: false, brightness: 40 },
  seats: { heatOn: false, position: 3 },
};

export function normalizeVehicle(v) {
  const s = v || {};
  return {
    ...defaultVehicle,
    ...s,
    climate: {
      on: s?.climate?.on ?? defaultVehicle.climate.on,
      temp:
        typeof s?.climate?.temp === "number"
          ? s.climate.temp
          : defaultVehicle.climate.temp,
    },
    media: {
      on: s?.media?.on ?? defaultVehicle.media.on,
      volume:
        typeof s?.media?.volume === "number"
          ? s.media.volume
          : defaultVehicle.media.volume,
    },
    lights: {
      on: s?.lights?.on ?? defaultVehicle.lights.on,
      brightness:
        typeof s?.lights?.brightness === "number"
          ? s.lights.brightness
          : defaultVehicle.lights.brightness,
    },
    seats: {
      heatOn: s?.seats?.heatOn ?? defaultVehicle.seats.heatOn,
      position:
        typeof s?.seats?.position === "number"
          ? s.seats.position
          : defaultVehicle.seats.position,
    },
  };
}
