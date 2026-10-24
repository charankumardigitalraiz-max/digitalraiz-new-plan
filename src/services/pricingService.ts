import { apiClient } from './apiClient';
import type { CarpoolPricingConfig, PricingConfigResponse } from '../types';

/**
 * Service for Admin Carpool Pricing Configuration
 * Matches endpoints specified in public/pricing.txt
 */
class PricingService {
  /**
   * 1. GET CURRENT CARPOOL PRICING CONFIG
   * GET /api/admin/pricing
   */
  async getPricingConfig(): Promise<CarpoolPricingConfig> {
    try {
      const response = await apiClient.get<PricingConfigResponse>('/api/admin/pricing');
      const carpool = response?.data?.config?.carpool;
      if (carpool) {
        const allowed =
          typeof carpool.allowedDeviationPercent === 'number'
            ? carpool.allowedDeviationPercent
            : 30.0;
        const minAllowed =
          typeof carpool.minAllowedDeviationPercent === 'number'
            ? carpool.minAllowedDeviationPercent
            : allowed;
        const maxAllowed =
          typeof carpool.maxAllowedDeviationPercent === 'number'
            ? carpool.maxAllowedDeviationPercent
            : allowed;

        return {
          pricePerKm: typeof carpool.pricePerKm === 'number' ? carpool.pricePerKm : 5.0,
          allowedDeviationPercent: allowed,
          minAllowedDeviationPercent: minAllowed,
          maxAllowedDeviationPercent: maxAllowed,
          platformCharge:
            typeof carpool.platformCharge === 'number' ? carpool.platformCharge : 0.0
        };
      }
    } catch (err) {
      console.warn('API get pricing notice (using local/fallback defaults):', err);
    }

    return {
      pricePerKm: 5.0,
      allowedDeviationPercent: 30.0,
      minAllowedDeviationPercent: 30.0,
      maxAllowedDeviationPercent: 30.0,
      platformCharge: 0.0
    };
  }

  /**
   * 2. UPDATE CARPOOL PRICING CONFIG
   * PUT /api/admin/pricing
   */
  async updatePricingConfig(config: Partial<CarpoolPricingConfig>): Promise<CarpoolPricingConfig> {
    const minDev = Number(
      config.minAllowedDeviationPercent ?? config.allowedDeviationPercent ?? 30.0
    );
    const maxDev = Number(
      config.maxAllowedDeviationPercent ?? config.allowedDeviationPercent ?? 30.0
    );
    const avgDev = Number(
      config.allowedDeviationPercent ?? Math.round((minDev + maxDev) / 2)
    );

    const payload = {
      carpool: {
        pricePerKm: Number(config.pricePerKm ?? 5.0),
        allowedDeviationPercent: avgDev,
        minAllowedDeviationPercent: minDev,
        maxAllowedDeviationPercent: maxDev,
        platformCharge: Number(config.platformCharge ?? 0.0)
      }
    };

    const response = await apiClient.put<PricingConfigResponse>('/api/admin/pricing', payload);
    const carpool = response?.data?.config?.carpool;
    if (carpool) {
      const allowed =
        typeof carpool.allowedDeviationPercent === 'number'
          ? carpool.allowedDeviationPercent
          : avgDev;

      return {
        pricePerKm: carpool.pricePerKm,
        allowedDeviationPercent: allowed,
        minAllowedDeviationPercent:
          typeof carpool.minAllowedDeviationPercent === 'number'
            ? carpool.minAllowedDeviationPercent
            : allowed,
        maxAllowedDeviationPercent:
          typeof carpool.maxAllowedDeviationPercent === 'number'
            ? carpool.maxAllowedDeviationPercent
            : allowed,
        platformCharge: carpool.platformCharge
      };
    }

    return payload.carpool;
  }
}

export const pricingService = new PricingService();
