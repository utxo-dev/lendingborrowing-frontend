

const getWalletBalance = async ({ address }) => {

    //https://mempool.space/testnet/api/address/
    console.log("address", address)

    let response = await fetch(`https://mempool.space/testnet/api/address/${address}/utxo`)
    let utxos = await response.json();

    let sorted_utxos = utxos.filter((value) => {
        return value.status.confirmed
    }).sort(function (a, b) {
        return b.value - a.value;
    })

    let result = []
    for (let i = 0; i < sorted_utxos.length; i++) {
        result.push(sorted_utxos[i])
    }
    let balance = result.reduce((total, val) => { return total + val.value }, 0)

    return balance;
};

export default getWalletBalance