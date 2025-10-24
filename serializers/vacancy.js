const {Vacancy, VacancyMatch} = require("../models/vacancy");
const {RefererVacancySerializer, } = require("./referer");



class VacancyMatchSerializer {
    constructor (vacancyId=null, SeekerId=null){
        this.vacancyId = vacancyId;
        this.SeekerId = SeekerId;
    };

    static async save(){
        VacancyMatch.insert({
            "vacancy_id": this.vacancyId,
            "seeker_id": this.SeekerId
        });
    };

    static async serializeAll(data) {
        let totalData = [];
        for (let obj of data){
            totalData.push(await this.serialize(obj));
        };
        return totalData;
    };

    static async serialize(data) {
        var vacancyData = await Vacancy.findById(data.vacancy_id);
        var vacancySerialized = await RefererVacancySerializer.serialize(vacancyData.data[0]);
        return {
            "vacancy": vacancySerialized,
            "seekerId": data.seeker_id,
        };
    };

}

exports.VacancyMatchSerializer = VacancyMatchSerializer;
