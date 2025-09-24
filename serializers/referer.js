const {Vacancy, VacancyExperience, VacancyRequirement, VacancyResponsibility, VacancySkill, VacancySeekedBySeekers} = require("../models/vacancy");
const User = require("../models/user");
const {Seeker, } = require("../models/seeker");
const {SeekerSerializer, } = require("./seeker");


class RefererVacancySerializer {
    static async serialize(vacancy){
        var requirements = await VacancyRequirement.findByVacancyId(vacancy.id);
        var experiences = await VacancyExperience.findByVacancyId(vacancy.id);
        var responsibilities = await VacancyResponsibility.findByVacancyId(vacancy.id);
        var skills = await VacancySkill.findByVacancyId(vacancy.id);

        var data = {
            "id": vacancy.id,
            "job_title": vacancy.job_title,
            "company_name": vacancy.company_name,
            "country": vacancy.country,
            "is_remote": vacancy.is_remote,
            "description": vacancy.description,
            "user_id": vacancy.user_id,
            "requirements": requirements.data,
            "experiences": experiences.data,
            "responsibilities": responsibilities.data,
            "skills": skills.data
        }
        return data;
    }

    static async serializeAll(vacancies){
        var data = []
        for (let vacancy of vacancies){
            data.push(await this.serialize(vacancy));
        }
        return data;
    }

    static async serializeWithDetail(vacancy){
        var vacanciesSeeked = await VacancySeekedBySeekers.findByVacancyId(vacancy.id);
        var seekersList = [];

        for (let obj of vacanciesSeeked.data){
            let seekerData = await Seeker.findById(obj.seeker_id);
            var seekerDetailData = await SeekerSerializer.serialize(seekerData.data[0])
            seekersList.push(seekerDetailData);
        };
        var data = await this.serialize(vacancy);
        data["seekersList"] = seekersList
        return data;
    }

};


exports.RefererVacancySerializer = RefererVacancySerializer;
