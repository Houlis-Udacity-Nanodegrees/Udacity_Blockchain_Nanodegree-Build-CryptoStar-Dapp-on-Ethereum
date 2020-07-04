const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async () => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
    const tokenId = 11;
    const instance = await StarNotary.deployed();
    await instance.createStar("New Star", tokenId, { from: owner })

    const tokenName = await instance.name();
    const tokenSymbol = await instance.symbol();

    assert.equal(tokenName, "Charis Choulis Token");
    assert.equal(tokenSymbol, "CCT");

});

it('lets 2 users exchange stars', async () => {
    const instance = await StarNotary.deployed();

    const tokenId1 = 15;
    const owner1 = accounts[1];
    const tokenId2 = 20;
    const owner2 = accounts[2];

    await instance.createStar("Star 1", tokenId1, { from: owner1 });
    await instance.createStar("Star 2", tokenId2, { from: owner2 });

    await instance.exchangeStars(tokenId1, tokenId2, { from: owner1 });

    assert.equal(await instance.ownerOf(tokenId1), owner2);
    assert.equal(await instance.ownerOf(tokenId2), owner1);
});

it('lets a user transfer a star', async () => {
    const instance = await StarNotary.deployed();
    const toUser = accounts[1]
    const tokenId = 14;

    await instance.createStar("A star", tokenId, { from: owner });

    await instance.transferStar(toUser, tokenId, { from: owner });

    assert.equal(await instance.ownerOf(tokenId), toUser);
});

it('lookUptokenIdToStarInfo test', async () => {
    const instance = await StarNotary.deployed();
    const tokenId = 12;

    await instance.createStar("A new star", tokenId, { from: owner });

    const name = await instance.lookUptokenIdToStarInfo(tokenId, { from: owner });

    assert.equal(name, "A new star");
});