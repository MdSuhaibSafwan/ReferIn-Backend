const {SeekerSerializer, } = require("../../serializers/seeker");
const {Seeker, } = require("../../models/seeker");
const {Vacancy, VacancyMatch} = require("../../models/vacancy");
const {RefererVacancySerializer, } = require("../../serializers/referer");


exports.getRefererSeeked = async (req, res, next) => {
    var vacancySeekedFetchedData = await VacancyMatch.findBySeekerId(req.seeker.id);
    var vacancyIdArrary = [];
    for (let obj of vacancySeekedFetchedData.data) {
        vacancyIdArrary.push(obj.vacancy_id);
    };
    var vacancyFetchedData = await Vacancy.findByArray(vacancyIdArrary);
    var serializedResponse = await RefererVacancySerializer.serializeAll(vacancyFetchedData.data);
    return res.status(200).json(serializedResponse);
};
