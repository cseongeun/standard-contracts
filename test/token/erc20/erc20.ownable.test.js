"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const time_1 = require("../../../util/time");
const string_1 = require("../../../util/string");
const generator_1 = require("../../../util/generator");
const { AddressZero, Zero, One, Two } = hardhat_1.ethers.constants;
const Three = ethers_1.BigNumber.from(3);
const { duration, increaseTo, latest } = time_1.time;
describe("ERC20OwnableMock", function () {
    // Players
    let owner;
    let user1;
    let user2;
    let user3;
    // Token Init Property
    let token;
    let tokenName = "ERC20OwnableMock";
    let tokenSymbol = "EOMK";
    let tokenDecimals = 18;
    let tokenInitalSupplyRaw = "1000";
    let tokenInitialSupply = ethers_1.BigNumber.from(tokenInitalSupplyRaw).mul(ethers_1.BigNumber.from(10).pow(tokenDecimals));
    let tokenSupplyCappedRaw = "10000";
    let tokenSupplyCapped = ethers_1.BigNumber.from(tokenSupplyCappedRaw).mul(ethers_1.BigNumber.from(10).pow(tokenDecimals));
    before(async function () {
        (0, generator_1.generateERC20Mocks)({
            metadata: {
                name: tokenName,
                symbol: tokenSymbol,
                premint: tokenInitalSupplyRaw,
            },
            features: {
                burnable: true,
                freezable: true,
                lockable: true,
                pausable: true,
                mintable: true,
            },
        });
        const accounts = await hardhat_1.ethers.getSigners();
        [owner, user1, user2, user3] = accounts;
    });
    beforeEach(async function () {
        const tokenContract = await hardhat_1.ethers.getContractFactory(tokenName, owner);
        token = await tokenContract.deploy();
    });
    describe("ERC20 Metadata", function () {
        it("Optional: returns the name of the token", async function () {
            (0, chai_1.expect)(await token.name()).to.equal(tokenName);
        });
        it("Optional: returns the symbol of the token", async function () {
            (0, chai_1.expect)(await token.symbol()).to.equal(tokenSymbol);
        });
        it("Optional: returns the number of decimals the token uses", async function () {
            (0, chai_1.expect)(await token.decimals()).to.equal(tokenDecimals);
        });
        it("Optional: Returns the total token supply.", async function () {
            (0, chai_1.expect)(await token.totalSupply()).to.equal(tokenInitialSupply);
        });
        // premint
        it("Optional: Returns the account balance of another account with address _owner.", async function () {
            (0, chai_1.expect)(await token.balanceOf(owner.address)).to.equal(tokenInitialSupply);
        });
    });
    describe("ERC20 Standard", function () {
        it("Required: Transfers _value amount of tokens to address _to, and MUST fire the Transfer event.", async function () {
            await (0, chai_1.expect)(() => token.connect(owner).transfer(user1.address, One)).to.changeTokenBalances(token, [owner, user1], [-One, One]);
            await (0, chai_1.expect)(token.connect(owner).transfer(user1.address, One))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, user1.address, One);
        });
        it("Required: Transfers _value amount of tokens from address _from to address _to, and MUST fire the Transfer event.", async function () {
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(() => token.connect(user1).transferFrom(owner.address, user2.address, One)).to.changeTokenBalances(token, [owner, user1, user2], [-One, Zero, One]);
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(token.connect(user1).transferFrom(owner.address, user2.address, One))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, user2.address, One);
        });
        it("Required: Prevents to of non-address to transfer", async function () {
            await (0, chai_1.expect)(token.connect(owner).transfer(AddressZero, One)).to.be.revertedWith("ERC20: transfer to the zero address");
        });
        it("Required: Prevents exceed-amount to transfer", async function () {
            await token.connect(owner).transfer(user1.address, One);
            await (0, chai_1.expect)(token.connect(user1).transfer(user2.address, Two)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
        it("Required: Prevents non-address to approve", async function () {
            await (0, chai_1.expect)(token.connect(owner).approve(AddressZero, One)).to.be.revertedWith("ERC20: approve to the zero address");
        });
        it("Required: Returns the amount which _spender is still allowed to withdraw from _owner.", async function () {
            (0, chai_1.expect)(await token.allowance(owner.address, user1.address)).to.equal(Zero);
        });
        it("Required: Allows _spender to withdraw from your account multiple times, up to the _value amount.", async function () {
            await token.connect(owner).approve(user1.address, One);
            (0, chai_1.expect)(await token.allowance(owner.address, user1.address)).to.equal(One);
            await (0, chai_1.expect)(token.connect(owner).approve(user1.address, One))
                .to.emit(token, "Approval")
                .withArgs(owner.address, user1.address, One);
        });
        it("Required: Prevents exceed-allowance to transferFrom", async function () {
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(token.connect(user1).transferFrom(owner.address, user2.address, Two)).to.be.revertedWith("ERC20: insufficient allowance");
        });
    });
    describe("ERC20 Recommend", function () {
        it("Recommend: Increase the amount of tokens that an owner allowed to a spender, and fire the Approval event", async function () {
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(token.connect(owner).increaseAllowance(user1.address, One))
                .to.emit(token, "Approval")
                .withArgs(owner.address, user1.address, Two);
            (0, chai_1.expect)(await token.allowance(owner.address, user1.address)).to.equal(Two);
        });
        it("Recommend: Decrease the amount of tokens that an owner allowed to a spender. and fire the Approval event", async function () {
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(token.connect(owner).decreaseAllowance(user1.address, One))
                .to.emit(token, "Approval")
                .withArgs(owner.address, user1.address, Zero);
            (0, chai_1.expect)(await token.allowance(owner.address, user1.address)).to.equal(Zero);
        });
        it("Recommend: Prevents decrease approve amount than the current allowance", async function () {
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(token.connect(owner).decreaseAllowance(user1.address, Two)).to.be.revertedWith("ERC20: decreased allowance below zero");
        });
    });
    describe("ERC20Ownable", function () {
        it("Extensions: Has an owner", async function () {
            (0, chai_1.expect)(await token.owner()).to.equal(owner.address);
        });
        it("Extensions: Changes owner after transfer ownership", async function () {
            await token.connect(owner).transferOwnership(user1.address);
            (0, chai_1.expect)(await token.owner()).to.equal(user1.address);
        });
        it("Extensions: Prevents non-owner from transfer ownership", async function () {
            await (0, chai_1.expect)(token.connect(user1).transferOwnership(user1.address)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Prevents non-address to transfer ownership", async function () {
            await (0, chai_1.expect)(token.connect(owner).transferOwnership(AddressZero)).to.be.revertedWith("Ownable: new owner is the zero address");
        });
        it("Extensions: Change owner to zero after renounce ownership", async function () {
            await token.connect(owner).renounceOwnership();
            (0, chai_1.expect)(await token.owner()).to.equal(AddressZero);
        });
        it("Extensions: Prevents non-owner from renounce ownership", async function () {
            await (0, chai_1.expect)(token.connect(user1).renounceOwnership()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    describe("ERC20Burnable", function () {
        it("Extensions: Allows within balance to burn. with decrease totalSupply and fire the Transfer event", async function () {
            await (0, chai_1.expect)(() => token.connect(owner).burn(One)).to.changeTokenBalances(token, [owner], [-One]);
            (0, chai_1.expect)(await token.totalSupply()).to.equal(tokenInitialSupply.sub(One));
            await (0, chai_1.expect)(token.connect(owner).burn(One))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, AddressZero, One);
        });
        it("Extensions: Allows within allowance balance to burnFrom. with decrease totalSupply and fire the Transfer, Approval event", async function () {
            await token.connect(owner).approve(user1.address, Three);
            await (0, chai_1.expect)(() => token.connect(user1).burnFrom(owner.address, One)).to.changeTokenBalances(token, [owner, user1], [-One, Zero]);
            (0, chai_1.expect)(await token.totalSupply()).to.equal(tokenInitialSupply.sub(One));
            await (0, chai_1.expect)(token.connect(user1).burnFrom(owner.address, One))
                .to.emit(token, "Approval")
                .withArgs(owner.address, user1.address, One);
            await (0, chai_1.expect)(token.connect(user1).burnFrom(owner.address, One))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, AddressZero, One);
        });
        it("Extensions: Prevents exceed balance to burn", async function () {
            await (0, chai_1.expect)(token.connect(user1).burn(One)).to.be.revertedWith("ERC20: burn amount exceeds balance");
        });
        it("Extensions: Prevents exceed allowance to burnFrom", async function () {
            await (0, chai_1.expect)(token.connect(user1).burnFrom(owner.address, One)).to.be.revertedWith("ERC20: insufficient allowance");
        });
    });
    describe("ERC20Mintable", function () {
        it("Extensions: Prevents non-owner to mint", async function () {
            await (0, chai_1.expect)(token.connect(user1).mint(user1.address, One)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Allows owner to mint. with increase totalSupply and fire the Transfer event", async function () {
            await (0, chai_1.expect)(() => token.connect(owner).mint(owner.address, One)).to.changeTokenBalance(token, owner, One);
            (0, chai_1.expect)(await token.totalSupply()).to.equal(tokenInitialSupply.add(One));
            await (0, chai_1.expect)(token.connect(owner).mint(owner.address, One))
                .to.emit(token, "Transfer")
                .withArgs(AddressZero, owner.address, One);
        });
    });
    describe("ERC20Pausable", function () {
        it("Extensions: Prevents non-owner from paused", async function () {
            await (0, chai_1.expect)(token.connect(user1).pause()).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Prevents non-owner from unpaused", async function () {
            await token.connect(owner).pause();
            await (0, chai_1.expect)(token.connect(user1).unpause()).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Prevents unpause when unpause state", async function () {
            await (0, chai_1.expect)(token.connect(owner).unpause()).to.be.revertedWith("Pausable: not paused");
        });
        it("Extensions: Prevents pause when pause state", async function () {
            await (0, chai_1.expect)(token.connect(owner).pause());
            await (0, chai_1.expect)(token.connect(owner).pause()).to.be.revertedWith("Pausable: paused");
        });
        it("Extensions: Change pause state after pause. and fire the Paused events", async function () {
            await (0, chai_1.expect)(token.connect(owner).pause())
                .to.emit(token, "Paused")
                .withArgs(owner.address);
        });
        it("Extensions: Change pause status after unpause. and fire the Unpaused event", async function () {
            await token.connect(owner).pause();
            await (0, chai_1.expect)(token.connect(owner).unpause())
                .to.emit(token, "Unpaused")
                .withArgs(owner.address);
        });
        it("Extensions: Allows transfer when unpaused", async function () {
            await (0, chai_1.expect)(() => token.connect(owner).transfer(user1.address, One)).to.changeTokenBalances(token, [owner, user1], [-One, One]);
        });
        it("Extensions: Allows transferFrom when unpaused", async function () {
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(() => token.connect(user1).transferFrom(owner.address, user2.address, One)).to.changeTokenBalances(token, [owner, user1, user2], [-One, Zero, One]);
        });
        it("Extensions: Prevents transfer when paused", async function () {
            await token.connect(owner).pause();
            await (0, chai_1.expect)(token.connect(owner).transfer(user1.address, One)).to.be.revertedWith("Pausable: token transfer while paused");
        });
        it("Extensions: Prevents transferFrom when paused", async function () {
            await token.connect(owner).pause();
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(token.connect(user1).transferFrom(owner.address, user2.address, One)).to.be.revertedWith("Pausable: token transfer while paused");
        });
        it("Extensions: Allows transfer when paused and then unpaused", async function () {
            await token.connect(owner).pause();
            await token.connect(owner).unpause();
            await (0, chai_1.expect)(() => token.connect(owner).transfer(user1.address, One)).to.changeTokenBalances(token, [owner, user1], [-One, One]);
        });
        it("Extensions: Allows transferFrom when paused and then unpaused", async function () {
            await token.connect(owner).pause();
            await token.connect(owner).unpause();
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(() => token.connect(user1).transferFrom(owner.address, user2.address, One)).to.changeTokenBalances(token, [owner, user1, user2], [-One, Zero, One]);
        });
        it("Extensions: Prevents mint when paused", async function () {
            await token.connect(owner).pause();
            await (0, chai_1.expect)(token.connect(owner).mint(owner.address, One)).to.be.revertedWith("Pausable: token transfer while paused");
        });
        it("Extensions: Prevents burn when paused", async function () {
            await token.connect(owner).pause();
            await (0, chai_1.expect)(token.connect(owner).burn(One)).to.be.revertedWith("Pausable: token transfer while paused");
        });
        it("Extensions: Allows mint when unpaused", async function () {
            await (0, chai_1.expect)(() => token.connect(owner).mint(owner.address, One)).to.changeTokenBalance(token, owner, One);
        });
        it("Extensions: Allows burn when unpaused", async function () {
            await (0, chai_1.expect)(() => token.connect(owner).burn(One)).to.changeTokenBalance(token, owner, -One);
        });
    });
    describe("ERC20Freezable", function () {
        it("Extensions: Prevents non-owner from freezed", async function () {
            await (0, chai_1.expect)(token.connect(user1).freeze(user2.address)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Prevents non-owner from unfreezed", async function () {
            await token.connect(owner).freeze(user1.address);
            await (0, chai_1.expect)(token.connect(user1).unfreeze(user1.address)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Change freeze state after freezed", async function () {
            await token.connect(owner).freeze(user1.address);
            (0, chai_1.expect)(await token.isFreezed(user1.address)).to.equal(true);
        });
        it("Extensions: Change freeze status after unfreezed", async function () {
            await token.connect(owner).freeze(user1.address);
            await token.connect(owner).unfreeze(user1.address);
            (0, chai_1.expect)(await token.isFreezed(user1.address)).to.equal(false);
        });
        it("Extensions: Allows transfer when sender, receiver unfreezed", async function () {
            await (0, chai_1.expect)(() => token.connect(owner).transfer(user1.address, One)).to.changeTokenBalances(token, [owner, user1], [-One, One]);
        });
        it("Extensions: Allows transferFrom when sender, spender, receiver unfreezed", async function () {
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(() => token.connect(user1).transferFrom(owner.address, user2.address, One)).to.changeTokenBalances(token, [owner, user1, user2], [-One, Zero, One]);
        });
        it("Extensions: Prevents transfer when sender freezed", async function () {
            await token.connect(owner).freeze(owner.address);
            await (0, chai_1.expect)(token.connect(owner).transfer(user1.address, One)).to.be.revertedWith("Freezable: sender freezed");
        });
        it("Extensions: Prevents transfer when receiver freezed", async function () {
            await token.connect(owner).freeze(user1.address);
            await (0, chai_1.expect)(token.connect(owner).transfer(user1.address, One)).to.be.revertedWith("Freezable: to freezed");
        });
        it("Extensions: Prevents transferFrom when sender freezed", async function () {
            await token.connect(owner).freeze(owner.address);
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(token.connect(user1).transferFrom(owner.address, user2.address, One)).to.be.revertedWith("Freezable: from freezed");
        });
        it("Extensions: Prevents transferFrom when spender freezed", async function () {
            await token.connect(owner).freeze(user1.address);
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(token.connect(user1).transferFrom(owner.address, user2.address, One)).to.be.revertedWith("Freezable: sender freezed");
        });
        it("Extensions: Prevents transferFrom when receiver freezed", async function () {
            await token.connect(owner).freeze(user2.address);
            await token.connect(owner).approve(user1.address, One);
            await (0, chai_1.expect)(token.connect(user1).transferFrom(owner.address, user2.address, One)).to.be.revertedWith("Freezable: to freezed");
        });
        it("Extensions: Prevents mint when to freezed", async function () {
            await token.connect(owner).freeze(user1.address);
            await (0, chai_1.expect)(token.connect(owner).mint(user1.address, One)).to.be.revertedWith("Freezable: to freezed");
        });
        it("Extensions: Prevents burn when from freezed", async function () {
            await token.connect(owner).freeze(owner.address);
            await (0, chai_1.expect)(token.connect(owner).burn(One)).to.be.revertedWith("Freezable: sender freezed");
        });
    });
    describe("ERC20TimeLockable", function () {
        let reason;
        let otherReason;
        let now;
        let beforeYear;
        let beforeHour;
        let afterHour;
        let afterYear;
        beforeEach(async function () {
            reason = (0, string_1.randomBytes)(32);
            otherReason = (0, string_1.randomBytes)(32);
            now = await latest();
            beforeYear = now.sub(duration.years(One));
            beforeHour = now.sub(duration.hours(One));
            afterHour = now.add(duration.hours(One));
            afterYear = now.add(duration.years(One));
        });
        it("Extensions: Prevents non-owner from transferWithLock", async function () {
            await token.connect(owner).transfer(user1.address, One);
            await (0, chai_1.expect)(token
                .connect(user1)
                .transferWithLock(user2.address, One, reason, afterHour)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Allows owner from transferWithLock. and fire the Locked event", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            (0, chai_1.expect)((0, string_1.formatStruct)(await token.locked(user1.address, reason))).to.deep.equal({ amount: One, release: afterHour, claimed: false });
            await (0, chai_1.expect)(token
                .connect(owner)
                .transferWithLock(user1.address, One, otherReason, afterHour))
                .to.emit(token, "Locked")
                .withArgs(user1.address, otherReason, One, afterHour);
        });
        it("Extensions: Prevents non-owner from extendLock", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await (0, chai_1.expect)(token.connect(user1).extendLock(user1.address, reason, afterYear)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Prevents extend lockup time if there is no lockup", async function () {
            await (0, chai_1.expect)(token.connect(owner).extendLock(user1.address, reason, afterYear)).to.be.revertedWith("Lockable: No tokens locked");
        });
        it("Extensions: Allows owner from extendLock. and fire the locked event", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await token.connect(owner).extendLock(user1.address, reason, afterYear);
            (0, chai_1.expect)((0, string_1.formatStruct)(await token.locked(user1.address, reason))).to.deep.equal({
                amount: One,
                release: afterHour.add(afterYear),
                claimed: false,
            });
        });
        it("Extensions: Prevents non-owner from increaseLockAmount", async function () {
            await token.connect(owner).transfer(user1.address, One);
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await (0, chai_1.expect)(token.connect(user1).increaseLockAmount(user1.address, reason, One)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Prevents increase lock amount if there is no locked", async function () {
            await (0, chai_1.expect)(token.connect(owner).increaseLockAmount(user1.address, reason, One)).to.be.revertedWith("Lockable: No tokens locked");
        });
        it("Extensions: Prevents increase lock zero amount", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await (0, chai_1.expect)(token.connect(owner).increaseLockAmount(user1.address, reason, Zero)).to.be.revertedWith("Lockable: Amount can not be zero");
        });
        it("Extensions: Prevents increase lock amount if holder has no amount", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await (0, chai_1.expect)(token.connect(owner).increaseLockAmount(user1.address, reason, One)).to.be.revertedWith("Lockable: Not enough amount");
        });
        it("Extensions: Allows owner from increaseLockAmount and fire the locked event", async function () {
            await token.connect(owner).transfer(user1.address, One);
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await token.connect(owner).increaseLockAmount(user1.address, reason, One);
            (0, chai_1.expect)((0, string_1.formatStruct)(await token.locked(user1.address, reason))).to.deep.equal({ amount: Two, release: afterHour, claimed: false });
        });
        it("Extensions: Prevents non-owner from lock", async function () {
            await token.connect(owner).transfer(user1.address, One);
            await (0, chai_1.expect)(token.connect(user2).lock(user1.address, One, reason, afterHour)).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Extensions: Prevents non-address to lock", async function () {
            await (0, chai_1.expect)(token.connect(owner).lock(AddressZero, One, reason, afterHour)).to.be.revertedWith("Lockable: lock account the zero address");
        });
        it("Extensions: Prevents zero amount to lock", async function () {
            await (0, chai_1.expect)(token.connect(owner).lock(user1.address, Zero, reason, afterHour)).to.be.revertedWith("Lockable: Amount can not be zero");
        });
        it("Extensions: Prevent the same reason lock for a specified address from lock", async function () {
            await token.connect(owner).transfer(user1.address, Two);
            await token.connect(owner).lock(user1.address, One, reason, afterHour);
            await (0, chai_1.expect)(token.connect(owner).lock(user1.address, One, reason, afterHour)).to.be.revertedWith("Lockable: Tokens already locked");
        });
        it("Extensions: Prevent exceed amount to lock", async function () {
            await token.connect(owner).transfer(user1.address, One);
            await (0, chai_1.expect)(token.connect(owner).lock(user1.address, Two, reason, afterHour)).to.be.revertedWith("Lockable: Not enough amount");
        });
        it("Extensions: Allows lock after the lock for the same reason unlocked", async function () {
            await token.connect(owner).transfer(user1.address, Two);
            await token.connect(owner).lock(user1.address, One, reason, afterHour);
            await increaseTo(afterHour);
            await (0, chai_1.expect)(() => token.connect(user1).transfer(user2.address, One)).to.changeTokenBalances(token, [user1, user2], [-One, One]);
            await token.connect(owner).lock(user1.address, One, reason, afterYear);
            (0, chai_1.expect)(await token.tokensLocked(user1.address, reason)).to.equal(One);
            (0, chai_1.expect)(await token.totalBalanceOf(user1.address)).to.equal(One);
            (0, chai_1.expect)(await token.tokensLockedAtTime(user1.address, reason, afterHour.add(One))).to.equal(One);
        });
        it("Extensions: Returns tokens locked for a specified address for a specified reason", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            (0, chai_1.expect)(await token.tokensLocked(user1.address, reason)).to.equal(One);
        });
        it("Extensions: Returns unlockable tokens for a specified address", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, beforeHour);
            (0, chai_1.expect)(await token.getUnlockableTokens(user1.address)).to.equal(One);
        });
        it("Extensions: Returns tokens locked for a specified address for a specified reason at a specific time", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterYear);
            (0, chai_1.expect)(await token.tokensLockedAtTime(user1.address, reason, afterHour)).to.equal(One);
            (0, chai_1.expect)(await token.tokensLockedAtTime(user1.address, reason, afterYear)).to.equal(Zero);
        });
        it("Extensions: Unlock which unlockable tokens when transfer. and fire the unlocked event", async function () {
            await (0, chai_1.expect)(token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, beforeHour))
                .to.emit(token, "Transfer")
                .withArgs(owner.address, user1.address, One);
            (0, chai_1.expect)(await token.balanceOf(user1.address)).to.equal(One);
        });
        it("Extensions: Returns transferable token to balanceOf", async function () {
            await token.connect(owner).transfer(user1.address, One);
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, beforeYear);
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, otherReason, afterYear);
            (0, chai_1.expect)(await token.balanceOf(user1.address)).to.equal(Two);
        });
        it("Extensions: Returns total tokens which locked and transferable for a specified address ", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, beforeHour);
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, otherReason, afterHour);
            (0, chai_1.expect)(await token.totalBalanceOf(user1.address)).to.equal(Two);
        });
        it("Extensions: Prevent transfers tokens locked", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await (0, chai_1.expect)(token.connect(user1).transfer(user2.address, One)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
        it("Extensions: Allows transfers tokens unlocked", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await increaseTo(afterHour);
            await (0, chai_1.expect)(() => token.connect(user1).transfer(user2.address, One)).to.changeTokenBalances(token, [user1, user2], [-One, One]);
        });
        it("Extensions: Prevent transferFrom token locked", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await token.connect(user1).approve(user2.address, One);
            await (0, chai_1.expect)(token.connect(user2).transferFrom(user1.address, user3.address, One)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
        it("Extensions: Allows transferFrom tokens unlocked", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await token.connect(user1).approve(user2.address, One);
            await increaseTo(afterHour);
            await (0, chai_1.expect)(() => token.connect(user2).transferFrom(user1.address, user3.address, One)).to.changeTokenBalances(token, [user1, user2, user3], [-One, Zero, One]);
        });
        it("Extensions: Prevents the same reason lock for a specified address from transferWithLock", async function () {
            await token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour);
            await (0, chai_1.expect)(token
                .connect(owner)
                .transferWithLock(user1.address, One, reason, afterHour)).to.be.revertedWith("Lockable: Tokens already locked");
        });
        it("Extensions: Prevents non-address from transferWithLock", async function () {
            await (0, chai_1.expect)(token
                .connect(owner)
                .transferWithLock(AddressZero, One, reason, afterHour)).to.be.revertedWith("Lockable: lock account the zero address");
        });
        it("Extensions: Prevents non-amount from transferWithLock", async function () {
            await (0, chai_1.expect)(token
                .connect(owner)
                .transferWithLock(user1.address, Zero, reason, afterHour)).to.be.revertedWith("Lockable: Amount can not be zero");
        });
        it("Extensions: Prevents exceed-amount from transferWithLock", async function () {
            const ownerBalance = await token.balanceOf(owner.address);
            await (0, chai_1.expect)(token
                .connect(owner)
                .transferWithLock(user1.address, ownerBalance.add(One), reason, afterHour)).to.be.revertedWith("Lockable: Not enough amount");
        });
    });
});
