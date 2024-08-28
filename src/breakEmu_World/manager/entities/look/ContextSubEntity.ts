import { SubEntity } from "@breakEmu_Protocol/IO"
import ContextEntityLook from "./ContextEntityLook"

class ContextSubEntity {

  private _bindingPointCategory: number
  private _bindingPointIndex: number
  private _subEntityLook: ContextEntityLook

  constructor(bindingPointCategory: number, bindingPointIndex: number, subEntityLook: ContextEntityLook) {
    this._bindingPointCategory = bindingPointCategory
    this._bindingPointIndex = bindingPointIndex
    this._subEntityLook = subEntityLook
  }

  public get bindingPointCategory(): number {
    return this._bindingPointCategory
  }

  public get bindingPointIndex(): number {
    return this._bindingPointIndex
  }

  public get subEntityLook(): ContextEntityLook {
    return this._subEntityLook
  }


  toSubEntity(): SubEntity {
    return new SubEntity(this.bindingPointCategory, this.bindingPointIndex, this.subEntityLook.toEntityLook())
  }
}

export default ContextSubEntity