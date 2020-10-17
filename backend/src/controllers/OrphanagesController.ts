import {Request, Response} from "express";
import { getRepository } from 'typeorm';
import Orphanages from '../models/Orphanage';
import orphanageView from '../views/orphanages_view';

import * as Yup from 'yup';

export default {
    async index(req:Request, res:Response) {
        const orphanagesRepository = getRepository(Orphanages);
        const orphanages = await orphanagesRepository.find({ relations: [ "images" ] });

        return res.json(orphanageView.renderMany(orphanages));
    }, 

    async show(req:Request, res:Response) {
        const { id } = req.params;

        const orphanagesRepository = getRepository(Orphanages);
        const orphanage = await orphanagesRepository.findOneOrFail(id, { relations: [ "images" ] });

        return res.json(orphanageView.render(orphanage));
    }, 

    async create(req:Request, res:Response) {
        const {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends
        } = req.body;
    
        const orphanagesRepository = getRepository(Orphanages);

        const reqImage = req.files as Express.Multer.File[];
        const images = reqImage.map(img => {
            return { path: img.filename }
        })
        
        const data = {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
            images    
        };

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
            about: Yup.string().required().max(300),
            instructions: Yup.string().required(),
            opening_hours: Yup.string().required(),
            open_on_weekends: Yup.boolean().required(),
            images: Yup.array(
                Yup.object().shape({
                    path: Yup.string().required()
                })
            ),
        });

        await schema.validate(data, {
            abortEarly: false
        });

        const orphanage = orphanagesRepository.create(data);
    
        await orphanagesRepository.save(orphanage);

        
        return res.status(201).json(orphanageView.render(orphanage));
    }
};