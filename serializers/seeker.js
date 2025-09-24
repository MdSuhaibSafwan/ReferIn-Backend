const {Seeker, SeekerSkill, SeekerEducation, SeekerWorkExperience} = require("../models/seeker");


class SeekerSerializer {

    static async serialize(seeker){
        var skills = await SeekerSkill.findBySeekerId(seeker.id);
        var educations = await SeekerEducation.findBySeekerId(seeker.id);
        var workExperiences = await SeekerWorkExperience.findBySeekerId(seeker.id);

        var data = {
            "id": seeker.id,
            "email": seeker.email,
            "full_name": seeker.full_name,
            "linkedin_url": seeker.linkedin_url,
            "image": seeker.image,
            "location": seeker.location,
            "skills": skills.data,
            "educations": educations.data,
            "workExperiences": workExperiences.data
        }
        return data;
    }

    static async serializeAll(seekers){
        var data = []
        for (let seeker of seekers){
            data.push(await this.serialize(seeker));
        }
        return data;
    }

};

exports.SeekerSerializer = SeekerSerializer;
