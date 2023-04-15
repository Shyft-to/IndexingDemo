import { OnModuleInit } from '@nestjs/common';
import { configuration } from './config';
import { Utility } from './utils';

const head = new Map<string, string>([
  ['x-api-key', configuration().API_KEY],
  ['Content-Type', 'application/json'],
]);

export class NftUserMap {
  constructor() {
    this.nftUserMap = new Map<string, string>();
  }
  async setup() {
    const res = await Utility.getRequest(
      configuration().SHFYFT_BASE_URI +
        '/candy_machine/nft_addresses?network=devnet&address=DiNnuyrwf8GqvKLWzXWYdtQhPxnNjynDTa8Jxu7fXyLp&version=v3',
      head,
    );
    this.nfts = res.result;

    const map = await this.createUserMap();
    console.log(map);
  }
  nfts: string[];
  nftUserMap: Map<string, string>;

  async createUserMap(): Promise<Map<string, string>> {
    for (const nft of this.nfts) {
      const res = await Utility.getRequest(
        configuration().SHFYFT_BASE_URI + `/nft/read?network=devnet&token_address=${nft}`,
        head,
      );
      this.nftUserMap.set(nft, res.result.owner);
    }

    return this.nftUserMap;
  }

  getUserSnapshot(): Map<string, string> {
    return this.nftUserMap;
  }

  updateSnapshot(nft: string, owner: string) {
    this.nftUserMap.set(nft, owner);
  }
}
