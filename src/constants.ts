import { avalancheFuji, holesky } from "viem/chains";

export const depositAddress = {
    [holesky.id]: ["0x07c75f0f0668536BBA46a69DEeC37D5020fE1054".toLowerCase()],
    [avalancheFuji.id]: ["0x07c75f0f0668536BBA46a69DEeC37D5020fE1054".toLowerCase()],
};

export const solverAddress = {
    [holesky.id]: ["0x40d5250D1ce81fdD1F0E0FB4F471E57AA0c1FaD3".toLowerCase()],
    [avalancheFuji.id]: ["0x40d5250D1ce81fdD1F0E0FB4F471E57AA0c1FaD3".toLowerCase()],
};  