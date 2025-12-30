export function useCalculations() {
    // Cálculo de Autonomia (Km/L)
    const calculateAutonomy = (currentKm: number, lastFullKm: number, liters: number) => {
        if (liters <= 0 || currentKm <= lastFullKm) return 0;
        const result = (currentKm - lastFullKm) / liters;
        return parseFloat(result.toFixed(2)); // Retorna ex: 14.55
    };

    // Alerta de Óleo (Baseado nos 500km solicitados)
    const checkOilChangeStatus = (currentKm: number, nextChangeKm: number) => {
        if (!nextChangeKm || !currentKm) return 'ok';

        const remaining = nextChangeKm - currentKm;

        if (remaining <= 0) return 'expired'; // Vermelho: Vencido
        if (remaining <= 500) return 'warning'; // Amarelo: Atenção (500km antes)
        return 'ok'; // Verde/Normal
    };

    return {
        calculateAutonomy,
        checkOilChangeStatus
    };
}