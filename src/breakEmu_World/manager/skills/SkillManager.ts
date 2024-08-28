import Character from "@breakEmu_API/model/character.model"
import Skill from "@breakEmu_API/model/skill.model"

class SkillManager {
	public static SKILL_DURATION = 35

	public static instance: SkillManager

	public static getInstance(): SkillManager {
		if (!SkillManager.instance) {
			SkillManager.instance = new SkillManager()
		}

		return SkillManager.instance
	}

	public getAllowedSkills(character: Character): Map<number, Skill> {
		let skills: Map<number, Skill> = new Map<number, Skill>()

		Skill.getSkills().forEach((skill: Skill) => {
			if (skill.parentJobId != 1) {

        const job = character.jobs.get(skill.parentJobId)

        if (job) {
          if (skill.levelMin <= job.level) {
            skills.set(skill.id, skill)
          }
        }
			} else {
        skills.set(skill.id, skill)
      }
		})

		return skills
	}
}

export default SkillManager
