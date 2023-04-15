import { Injectable, OnModuleInit } from '@nestjs/common';
import { configuration } from './config';
import { Utility } from './utils';
import { decode } from 'bs58';
import { Keypair, Transaction } from '@solana/web3.js';
import { NftUserMap } from './nftmap';
import { StartCallbackDto } from './dto';

type createRequest = {
  network: string;
  addresses: string[];
  callback_url: string;
};

type stopRequest = {
  id: string;
};

type candyMachineMintRequest = {
  network: string;
  wallet: string;
  authority: string;
  candy_machine: string;
};

type SignRequest = {
  network: string;
  encoded_transaction: string;
};
let cmCallbackId;

@Injectable()
export class AppService {
  constructor() {
    this.userMap = new NftUserMap();
  }
  async setup(data: StartCallbackDto) {
    await this.userMap.setup();
    this.activeUrl = data.url;
    this.walletMaps = new Map<string, string>([
      [
        'AaYFExyZuMHbJHzjimKyQBAH1yfA9sKTxSzBc6Nr5X4s',
        '41zT4s2kNukmBNQWMFPSzo3VQbjhers5TP6tyvr3MjqvJAETMmQybZtRsRXPK1rdA1xBJruy4n58Zb1pNmoKy7y1',
      ],
      [
        'EijtaNNHqqaPmWwAmUi8f1TC6gSPnqkoodQd2BLFpA8T',
        '5o3AgY42CN66FNqcKwWfs1AMByha3auAbLN8KUsCcwypRdLN6JhNsKUUvi4ZxLypbAHZVPwLkfdh4oEqApM2D4No',
      ],
      [
        'HFiyiUWFxmyKgBwCZ5ay9MYG4AajRDAJBiyRxYqM9JC',
        '44dk3QfQYSCFKidBj8rRXwaeo3rrdEeKp1DGyHw5AjJphPxg7YDP2V1mPPbV23CERqFwT41h7hk7KMJ7DxR31DpG',
      ],
      [
        'Eb3ykuiCtvGcqs4XRCASThFf4EUxrL7k3TZsytWkXTBe',
        '4NeZU52Zks2fLjdv6BhHZ6GjJwk1d2EsZVHK7BenuqLbwsF48SLkaGH3FjKZ9vLeKHSwG1QXTLTrvZPbTuzmwH28',
      ],
      [
        '6onZzXdurac4ykUCqLewQLDPwfmgHRU9Cu9k6A6anPtx',
        '4TadDATPtRe89U2wyiWvQ64ur8u73wyVaX1KRaqEfAHHDwWiEXCMLCbBbYqgz9vTWm5AxNt9HwQ6W1TJmEJSAidJ',
      ],
      [
        '8hDQqsj9o2LwMk2FPBs7Rz5jPuzqKpRvkeeo6hMJm5Cv',
        '2sABiwsbNSLWv34Y9Sss5JUozj6kQqF1WJLU6DMKomqLDzyx5u3NgpbzGxAJukfRGB9Tnc5h4XTbx7oiUP3YPsM4',
      ],
      [
        'EYS5EwzbRnfEzmK8focjxm8kx3dyJN9JpsJDcB5pEzmr',
        '23oDyxtLRagbzMGxy65LiUXe3FvspWdw9n5qWk4jCrNvuuK81JH33Y4XvdLty1GfxgWZXUUjn5qngzZWi2pRqN3W',
      ],
    ]);

    this.startCMCallback(this.activeUrl);

    const snap = this.userMap.getUserSnapshot();
    for (const [key, value] of snap) {
      if (value != '') {
        this.listenOnNft(key);
      }
    }
  }
  private walletMaps: Map<string, string>;
  private activeUrl: string;
  private userMap: NftUserMap;
  private nftCallbackIds: string[] = [];

  async startCMCallback(url: string, address?: string): Promise<any> {
    if (cmCallbackId) {
      return `callback for candymachine already running with id ${cmCallbackId}`;
    }
    const ad = address ?? configuration().CANDY_MACHINE_ID;
    const req: createRequest = {
      network: 'devnet',
      addresses: [ad],
      callback_url: url,
    };

    const head = new Map<string, string>([
      ['x-api-key', configuration().API_KEY],
      ['Content-Type', 'application/json'],
    ]);
    this.activeUrl = url;
    const res = await Utility.postRequest(configuration().SHFYFT_BASE_URI + '/callback/create', req, head);

    cmCallbackId = res.data.result.id;
    const message = `Started a callback at ${ad}, on ${req.network}, listening on ${req.callback_url}.`;
    console.log(message);

    return {
      message: `Started a callback at ${ad}, on ${req.network}, listening on ${req.callback_url}.`,
      server_response: res,
    };
  }

  async stopCallback(): Promise<any> {
    try {
      const req: stopRequest = {
        id: cmCallbackId,
      };

      const head = new Map<string, string>([
        ['x-api-key', configuration().API_KEY],
        ['Content-Type', 'application/json'],
      ]);

      const res = await Utility.deleteRequest(configuration().SHFYFT_BASE_URI + '/callback/remove', req, head);
      cmCallbackId = null;

      return {
        message: `Stoped a callback at ${configuration().CANDY_MACHINE_ID}.`,
        server_response: res,
      };
    } catch (err) {
      console.log(err);
    }
  }

  async startMinting() {
    try {
      for (let i = 0; i < 1; i++) {
        const res = await this.mintNft();
        console.log(res);
      }

      return {
        message: `minting NFTs from Candy Machine ${configuration().CANDY_MACHINE_ID}.`,
      };
    } catch (err) {
      console.log(err);
    }
  }

  private async mintNft() {
    const w = this.getWallet();
    const req: candyMachineMintRequest = {
      network: 'devnet',
      candy_machine: configuration().CANDY_MACHINE_ID,
      wallet: w.key,
      authority: configuration().CANDY_AUTHORITY,
    };

    const head = new Map<string, string>([
      ['x-api-key', configuration().API_KEY],
      ['Content-Type', 'application/json'],
    ]);

    const res = await Utility.postRequest(configuration().SHFYFT_BASE_URI + '/candy_machine/mint', req, head);
    cmCallbackId = null;
    const txn = res.data.result.encoded_transaction;
    console.log(res.data);
    const recoveredTransaction = Transaction.from(Buffer.from(txn, 'base64'));
    const k = Keypair.fromSecretKey(decode(w.value));
    recoveredTransaction.partialSign(k);

    const signRequest: SignRequest = {
      network: 'devnet',
      encoded_transaction: recoveredTransaction.serialize().toString('base64'),
    };
    const mintRes = await Utility.postRequest(
      configuration().SHFYFT_BASE_URI + '/transaction/send_txn',
      signRequest,
      head,
    );
    return mintRes;
  }

  getWallet(): { key: string; value: string } {
    const l = this.walletMaps.keys.length;
    const randomInteger: number = Math.floor(Math.random() * l);
    let i = 0;
    for (const [key, value] of this.walletMaps) {
      console.log(key, value);
      if (i == randomInteger) {
        return { key, value };
      }
      i++;
    }
  }

  getsnapshot(): any {
    const myObject = Object.fromEntries(this.userMap.getUserSnapshot().entries());
    return myObject;
  }

  handleEvent(data: any) {
    switch (data.type) {
      case 'NFT_MINT':
        this.handleMint(data.actions);
        break;
      case 'NFT_TRANSFER':
        this.handleNftTransfer(data.actions);
        break;
      case 'NFT_BURN':
        this.handleNftBurn(data.actions);
        break;
    }
    // throw new Error('Method not implemented.');
  }

  handleNftBurn(actions: any) {
    let nft: string;
    let owner: string;
    actions.forEach((x) => {
      if (x.type == 'NFT_BURN') {
        nft = x.info.nft_address;
        owner = '';
      }
    });

    console.log(`handling burn event nft: ${nft}`);
    this.userMap.updateSnapshot(nft, owner);
  }
  handleNftTransfer(actions: any) {
    let nft: string;
    let owner: string;
    actions.forEach((x) => {
      if (x.type == 'NFT_TRANSFER') {
        nft = x.info.nft_address;
        owner = x.info.receiver;
      }
    });

    console.log(`handling transfer event nft: ${nft}`);
    this.userMap.updateSnapshot(nft, owner);
  }

  handleMint(actions: any[]) {
    let nft: string;
    let owner: string;
    actions.forEach((x) => {
      if (x.type == 'NFT_MINT') {
        nft = x.info.nft_address;
        owner = x.info.owner;
      }
    });

    console.log(`handling mint event nft: ${nft}`);
    this.userMap.updateSnapshot(nft, owner);
    this.listenOnNft(nft);
  }

  async listenOnNft(nft: string) {
    const req: createRequest = {
      network: 'devnet',
      addresses: [nft],
      callback_url: this.activeUrl,
    };

    const head = new Map<string, string>([
      ['x-api-key', configuration().API_KEY],
      ['Content-Type', 'application/json'],
    ]);
    const res = await Utility.postRequest(configuration().SHFYFT_BASE_URI + '/callback/create', req, head);
    const cId = res.data.result.id;
    this.nftCallbackIds.push(cId);
  }

  // updateCallback():
  getHello(): string {
    return 'Hello World!';
  }
}
