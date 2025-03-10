import {
    getAllSubjects,
    getSubjectById,
    addSubject,
    updateSubject,
    deleteSubject,
    getSubjectsByClass,
    searchSubjects
} from '../models/subject.model.js';

const getAllSubjectsController = async (req , res ) => {
    try {
        const subjects = await getAllSubjects();
        res.json(subjects);
    }catch (error) {
        res.status(500).json({error: error.message});
    }
}

const getSubjectsByIdController = async (req, res) => {
    const subjectId = req.params.id;
    try {
        const subject = await getSubjectById(subjectId);
        res.json(subject);
    }catch (error) {
        res.status(500).json({error: error.message});
    }
}

const addSubjectController = async (req, res) => {
    const subject = req.body;
    try {
        const result = await addSubject(subject);
        res.status(201).json(result);
    }catch (error) {
        res.status(500).json({error: error.message});
    }
}

const updateSubjectController = async (req, res) => {
   
    try {
        const subjectId = req.params.id;
        const subject = req.body;
        const result = await updateSubject(subjectId, subject);
        res.json(result);
    }catch (error) {
        res.status(500).json({error: error.message});
    }
}

const deleteSubjectController = async (req, res) => {
    const subjectId = req.params.id;
    try {
        const result = await deleteSubject(subjectId);
        res.json(result);
    }catch (error) {
        res.status(500).json({error: error.message});
    }
}

const getSubjectsByClassController = async (req, res) => {
    const classId = req.params.id;
    try {
        const subjects = await getSubjectsByClass(classId);
        res.json(subjects);
    }catch (error) {
        res.status(500).json({error: error.message});
    }
}

const searchSubjectsController = async (req, res) => {
    const {SubjectName, ClassID} = req.body;
    try {
        const subjects = await searchSubjects(SubjectName, ClassID);
        res.json(subjects);
    }catch (error) {
        res.status(500).json({error: error.message});
    }
}

export {
    getAllSubjectsController,
    getSubjectsByIdController,
    addSubjectController,
    updateSubjectController,
    deleteSubjectController,
    getSubjectsByClassController,
    searchSubjectsController
};


