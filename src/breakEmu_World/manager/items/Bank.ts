import BankItem from "@breakEmu_API/model/BankItem.model";
import Character from "@breakEmu_API/model/character.model";
import ItemCollection from "./collections/ItemCollections";

class Bank extends ItemCollection<BankItem> {
  character: Character;

  kamas: number = 0;

  constructor(character: Character, items: BankItem[] = [], kamas: number = 0) {
    super(items);
    this.character = character;
    this.kamas = kamas;
  }


  public onItemAdded(item: BankItem): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public onItemStacked(item: BankItem): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public onItemRemoved(item: BankItem): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public onItemUnstacked(item: BankItem): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public onItemsAdded(items: BankItem[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public onItemsStackeds(items: BankItem[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public onItemsRemoved(items: BankItem[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public onItemsUnstackeds(items: BankItem[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public onItemQuantityChanged(item: BankItem): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public onItemsQuantityChanged(item: BankItem[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default Bank;