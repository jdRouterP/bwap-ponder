import { avalancheFuji, holesky } from "viem/chains";

export const depositAddress = {
    [holesky.id]: ["0x25FA874601756484e51807b14Cc8114812F342BE".toLowerCase()],
    [avalancheFuji.id]: ["0x25FA874601756484e51807b14Cc8114812F342BE".toLowerCase()],
};

export const solverAddress = {
    [holesky.id]: ["0x37570ff9b303E80EaB26FDAd5f94FAb2be2d29EE".toLowerCase()],
    [avalancheFuji.id]: ["0x37570ff9b303E80EaB26FDAd5f94FAb2be2d29EE".toLowerCase()],
};  