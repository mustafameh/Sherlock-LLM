import { NextRequest, NextResponse } from 'next/server';
import { attachTrialCookie, getTrialApiKey, getTrialIdentity, getTrialStatus, trialConfig } from '@/lib/server/trial';

/** Free-trial allowance of the current visitor. Never includes the key or the visitor's IP. */
export async function GET(request: NextRequest) {
    if (!getTrialApiKey()) {
        return NextResponse.json({ enabled: false });
    }

    try {
        const identity = getTrialIdentity(request);
        const status = await getTrialStatus(identity);
        const response = NextResponse.json({ enabled: true, model: trialConfig.model, ...status });
        attachTrialCookie(response, identity);
        return response;
    } catch (error) {
        console.error('Trial status error:', error instanceof Error ? error.message : error);
        return NextResponse.json({ enabled: false }, { status: 500 });
    }
}
