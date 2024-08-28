import { ObjectEffect, ObjectEffectDice } from "@breakEmu_Protocol/IO"
import AsyncRandom from "../../AsyncRandom"
import EffectInteger from "./EffectInteger"

class EffectDice extends EffectInteger {
  public min: number;
  public max: number;

  constructor(effectId: number, min: number, max: number, value: number, order: number, targetId: number, targetMask: string, duration: number, delay: number, random: number, group: number, modificator: number, trigger: string, rawTriggers: string, rawZone: string, dispellable: number) {
      super(effectId, order, targetId, targetMask, duration, delay, random, group, modificator, trigger, rawTriggers, rawZone, dispellable, value);
      this.min = min;
      this.max = max;
  }

  public generate(random: AsyncRandom, perfect: boolean = false): EffectInteger {
      if (this.value !== 0) {
          return new EffectInteger(this.effectId, this.order, this.targetId, this.targetMask, this.duration, this.delay, this.random, this.group, this.modificator, this.trigger, this.rawTriggers, this.rawZone, this.dispellable, this.value);
      }
      if (this.min > this.max) {
          return new EffectInteger(this.effectId, this.order, this.targetId, this.targetMask, this.duration, this.delay, this.random, this.group, this.modificator, this.trigger, this.rawTriggers, this.rawZone, this.dispellable, this.min);
      }
      if (perfect) {
        return new EffectInteger(this.effectId, this.order, this.targetId, this.targetMask, this.duration, this.delay, this.random, this.group, this.modificator, this.trigger, this.rawTriggers, this.rawZone, this.dispellable, this.max);
      } else {
        return new EffectInteger(this.effectId, this.order, this.targetId, this.targetMask, this.duration, this.delay, this.random, this.group, this.modificator, this.trigger, this.rawTriggers, this.rawZone, this.dispellable, random.next(this.min, this.max + 1));
      }
  }

  public getDelta(): number {
      const random = new AsyncRandom();
      return this.min < this.max ? random.next(this.min, this.max + 1) : this.min;
  }

  public equals(obj: any): boolean {
      if (!(obj instanceof EffectDice)) return false;
      const effect = obj as EffectDice;
      return this.effectId === effect.effectId &&
             this.min === effect.min &&
             this.max === effect.max &&
             this.value === effect.value;
  }

  public clone(): EffectDice {
      return new EffectDice(this.effectId, this.min, this.max, this.value, this.order, this.targetId, this.targetMask, this.duration, this.delay, this.random, this.group, this.modificator, this.trigger, this.rawTriggers, this.rawZone, this.dispellable);
  }

  public override getObjectEffect(): ObjectEffect {
      return new ObjectEffectDice(this.effectId, this.min, this.max, this.value);
  }

  public saveAsJson(): any {
      return {
        effectId: this.effectId,
        min: this.min,
        max: this.max,
        value: this.value,
        order: this.order,
        targetId: this.targetId,
        targetMask: this.targetMask,
        duration: this.duration,
        delay: this.delay,
        random: this.random,
        group: this.group,
        modificator: this.modificator,
        trigger: this.trigger,
        rawTriggers: this.rawTriggers,
        rawZone: this.rawZone,
        dispellable: this.dispellable,
    }
  }
}

export default EffectDice
