import { avalancheFuji, holesky } from "viem/chains";

export const depositAddress = {
    [holesky.id]: ["0x9A9dF446993f093F221b353c96b757D316629a9c".toLowerCase()],
    [avalancheFuji.id]: ["0x9A9dF446993f093F221b353c96b757D316629a9c".toLowerCase()],
};

export const solverAddress = {
    [holesky.id]: ["0x37570ff9b303E80EaB26FDAd5f94FAb2be2d29EE".toLowerCase()],
    [avalancheFuji.id]: ["0x37570ff9b303E80EaB26FDAd5f94FAb2be2d29EE".toLowerCase()],
};  