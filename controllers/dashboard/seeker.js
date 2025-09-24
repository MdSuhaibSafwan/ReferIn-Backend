const {SeekerSerializer, } = require("../../serializers/seeker");
const {Seeker, } = require("../../models/seeker");
const {Vacancy, VacancySeekedBySeekers} = require("../../models/vacancy");
const {RefererVacancySerializer, } = require("../../serializers/referer");


exports.getRefererSeeked = async (req, res, next) => {
    var vacancySeekedFetchedData = await VacancySeekedBySeekers.findBySeekerId("11b1af83-f7c4-40c2-bb76-53491caeaac3");
    var vacancyIdArrary = [];
    for (let obj of vacancySeekedFetchedData.data) {
        vacancyIdArrary.push(obj.vacancy_id);
    };
    var vacancyFetchedData = await Vacancy.findByArray(vacancyIdArrary);
    var serializedResponse = await RefererVacancySerializer.serializeAll(vacancyFetchedData.data);
    return res.status(200).json(serializedResponse);
};
