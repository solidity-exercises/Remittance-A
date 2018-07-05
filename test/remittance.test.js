const Remittance = artifacts.require('../contracts/Remittance.sol');
const Keccak256 = artifacts.require('./utils/Keccak256.sol');
const testUtil = require('./utils/test.util.js');

contract('Remittance', (accounts) => {
    let con;
    let sender;
    let recepient;
    let exchange;
    let password;
    let passHash;
    let keccak;
    let key;
    
	beforeEach( async () => {
        con = await Remittance.new();
        keccak = await Keccak256.new();
        sender = accounts[1];
        recepient = accounts[2];
        exchange = accounts[3];
        password = "password";
        passHash = await web3.sha3(web3.toHex(password), {encoding:"hex"});
        key = await keccak.encodeKey(exchange, passHash, sender, recepient);
    });

    it('addRemittance Should add remittance to anybody', async () => {
        await con.addRemittance(exchange, passHash, recepient, {from: sender, value: web3.toWei('1', 'ether')});

        const value = await con.getValue(key);

        assert.equal(value, web3.toWei('1','ether'));
    });

    it('addRemittance Should not allow 0 as payment', async () => {
        const remit = con.addRemittance(exchange, passHash, recepient, {from: sender, value: web3.toWei('0', 'ether')});

        await testUtil.assertRevert(remit);
    });

    it('addRemittance Should not allow exchange to be same as recepient', async () => {
        const remit = con.addRemittance(recepient, passHash, recepient, {from: sender, value: web3.toWei('1', 'ether')});

        await testUtil.assertRevert(remit);
    });

    it('addRemittance Should not allow exchange to be same as sender', async () => {
        const remit = con.addRemittance(sender, passHash, recepient, {from: sender, value: web3.toWei('1', 'ether')});

        await testUtil.assertRevert(remit);
    });

    it('addRemittance Should not allow exchange to be same as owner', async () => {
        const remit = con.addRemittance(accounts[0], passHash, recepient, {from: sender, value: web3.toWei('1', 'ether')});

        await testUtil.assertRevert(remit);
    });

    it('addRemittance Should not allow sender to be same as recepient', async () => {
        const remit = con.addRemittance(exchange, passHash, recepient, {from: recepient, value: web3.toWei('1', 'ether')});

        await testUtil.assertRevert(remit);
    });


    it('addRemittance Should not allow sender to be same as owner', async () => {
        const remit = con.addRemittance(exchange, passHash, recepient, {from: accounts[0], value: web3.toWei('1', 'ether')});

        await testUtil.assertRevert(remit);
    });


    it('withdraw Should allow exchange to withdraw remittance money When given password from recepient', async () => {
        await con.addRemittance(exchange, passHash, recepient, {from: sender, value: web3.toWei('1', 'ether')});

        await con.withdraw(passHash, sender, recepient, {from: exchange});

        const valueAfterWithdraw = await con.getValue(key);

        assert.equal(valueAfterWithdraw, 0);
    });

    it('withdraw Should not allow money to be withdrawn When given not given password from recepient', async () => {
        const randomPass = await web3.sha3(web3.toHex("randomPass"), {encoding:"hex"});
        await con.addRemittance(exchange, randomPass, recepient, {from: sender, value: web3.toWei('1', 'ether')});

        const withdrawal = con.withdraw(passHash, sender, recepient, {from: exchange});

        await testUtil.assertRevert(withdrawal);
    });

    it('owner Should be able to set commission', async () => {
        await con.setCommissionPercentage(2, {from: accounts[0]});

        const comm = await con.commissionPercentage.call();

        assert.equal(comm, 2);
    });

    it('ownerWithdraw Should allow owner to withdraw commission money', async () => {
        await con.setCommissionPercentage(2, {from: accounts[0]});
        
        await con.addRemittance(exchange, passHash, recepient, {from: sender, value: web3.toWei('1', 'ether')});

        await con.ownerWithdraw();  

        const balanceAfterWithdraw = await con.getContractBalance();

        assert.equal(balanceAfterWithdraw, 0);
    });
});