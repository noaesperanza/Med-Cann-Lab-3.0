/**
 * Renal Function Calculations Module
 * Uses CKD-EPI 2021 Creatinine Equation
 */

export interface RenalProfile {
    creatinine: number; // mg/dL
    age: number;
    sex: 'male' | 'female';
    isBlack?: boolean; // Legacy factor, kept for compatibility if needed, but CKD-EPI 2021 removed race
}

export interface RenalAssessment {
    egfr: number;
    stage: 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5';
    description: string;
    actionPlan: string;
}

/**
 * Calculates eGFR using CKD-EPI 2021 Formula
 * Reference: https://www.kidney.org/content/ckd-epi-creatinine-equation-2021
 */
export const calculateEGFR = (profile: RenalProfile): number => {
    const { creatinine, age, sex } = profile;

    // Constants based on sex
    const alpha = sex === 'female' ? 0.7 : 0.9;
    const kappa = sex === 'female' ? -0.241 : -0.302;
    // Note: 2021 equation does not use the race factor (1.159) for black patients anymore
    // but uses different multipliers for male/female

    // CKD-EPI 2021
    // eGFR = 142 x min(Scr/K, 1)^alpha x max(Scr/K, 1)^-1.200 x 0.9938^Age x 1.012 [if female]

    const K = sex === 'female' ? 0.7 : 0.9;
    const genderFactor = sex === 'female' ? 1.012 : 1;
    const alphaFactor = sex === 'female' ? -0.241 : -0.302;

    const scrOverK = creatinine / K;
    const minPart = Math.min(scrOverK, 1) ** alphaFactor;
    const maxPart = Math.max(scrOverK, 1) ** -1.200;

    let egfr = 142 * minPart * maxPart * (0.9938 ** age) * genderFactor;

    return parseFloat(egfr.toFixed(1));
};

/**
 * Classifies CKD Stage (KDIGO)
 */
export const classifyStage = (egfr: number): RenalAssessment['stage'] => {
    if (egfr >= 90) return 'G1';
    if (egfr >= 60) return 'G2';
    if (egfr >= 45) return 'G3a';
    if (egfr >= 30) return 'G3b';
    if (egfr >= 15) return 'G4';
    return 'G5';
};

export const getStageDescription = (stage: string): { desc: string, action: string } => {
    switch (stage) {
        case 'G1':
            return { desc: 'Normal ou Elevado', action: 'Monitoramento anual se houver outros riscos.' };
        case 'G2':
            return { desc: 'Levemente Diminuído', action: 'Monitorar progressão e pressão arterial.' };
        case 'G3a':
            return { desc: 'Leve a Moderado', action: 'Avaliar complicações (ósseas, anemia). Consultar nefrologista.' };
        case 'G3b':
            return { desc: 'Moderado a Grave', action: 'Monitoramento estrito. Preparação para tratamentos avançados.' };
        case 'G4':
            return { desc: 'Gravemente Diminuído', action: 'Preparo para terapia de substituição renal (diálise/transplante).' };
        case 'G5':
            return { desc: 'Falência Renal', action: 'Diálise ou transplante indicados iminentemente.' };
        default:
            return { desc: 'Indeterminado', action: 'Repetir exames.' };
    }
};

export const generateRenalAssessment = (profile: RenalProfile): RenalAssessment => {
    const egfr = calculateEGFR(profile);
    const stage = classifyStage(egfr);
    const info = getStageDescription(stage);

    return {
        egfr,
        stage,
        description: info.desc,
        actionPlan: info.action
    };
};
