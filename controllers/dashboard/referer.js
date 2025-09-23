const {Vacancy, } = require("../../models/vacancy");
const {RefererVacancySerializer, } = require("../../serializers/referer")


exports.getVacancies = async (req, res, next) => {
    var vacancyFetchedData = await Vacancy.fetchAll();

    var resultData = await RefererVacancySerializer.serializeAll(vacancyFetchedData.data)
    res.status(200).json(resultData);
};

exports.getVacancyDetail = async (req, res, next) => {
    var id = req.params.id;
    var vacancyFetchedData = await Vacancy.findById(id);
    var resultData = await RefererVacancySerializer.serializeWithDetail(vacancyFetchedData.data[0])
    res.status(200).json(resultData);

};
