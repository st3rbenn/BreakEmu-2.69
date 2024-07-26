import BankItem from "../../../breakEmu_API/model/BankItem.model";
import Character from "../../../breakEmu_API/model/character.model";
import ItemCollection from "./collections/ItemCollections";

class Bank extends ItemCollection<BankItem> {
  character: Character;

  kamas: number = 0;

  constructor(character: Character, items: BankItem[] = [], kamas: number = 0) {
    super(items);
    this.character = character;
    this.kamas = kamas;
  }


  public onItemAdded(item: BankItem): void {
    // await 
  }
  public onItemStacked(item: BankItem): void {
    throw new Error("Method not implemented.");
  }
  public onItemRemoved(item: BankItem): void {
    throw new Error("Method not implemented.");
  }
  public onItemUnstacked(item: BankItem): void {
    throw new Error("Method not implemented.");
  }
  public onItemsAdded(items: BankItem[]): void {
    throw new Error("Method not implemented.");
  }
  public onItemsStackeds(items: BankItem[]): void {
    throw new Error("Method not implemented.");
  }
  public onItemsRemoved(items: BankItem[]): void {
    throw new Error("Method not implemented.");
  }
  public onItemsUnstackeds(items: BankItem[]): void {
    throw new Error("Method not implemented.");
  }
  public onItemQuantityChanged(item: BankItem): void {
    throw new Error("Method not implemented.");
  }
  public onItemsQuantityChanged(item: BankItem[]): void {
    throw new Error("Method not implemented.");
  }
}

export default Bank;