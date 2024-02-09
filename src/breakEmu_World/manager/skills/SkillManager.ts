import Character from "../../../breakEmu_API/model/character.model"
import Job from "../../../breakEmu_API/model/job.model"
import Skill from "../../../breakEmu_API/model/skill.model"

class SkillManager {
	public SKILL_DURATION = 35

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
			if (skill.ParentJobId != 1) {

        const job = character.jobs.get(skill.ParentJobId)

        if (job) {
          if (skill.LevelMin <= job.level) {
            skills.set(skill.Id, skill)
          }
        }
			} else {
				skills.set(skill.Id, skill)
			}
		})

		return skills
	}
}

export default SkillManager
