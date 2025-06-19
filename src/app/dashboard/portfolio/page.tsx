'use client';

import { useEffect, useState } from 'react';
import { Buy } from '@coinbase/onchainkit/buy'; 
import { getPortfolios } from '@coinbase/onchainkit/api';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign } from 'lucide-react';
import { ASSET_ADDRESSES } from '@/lib/constants';
import { Token } from '@coinbase/onchainkit/token';


const USDC: Token = {
    address: ASSET_ADDRESSES.BASE.USDC as `0x${string}`,
    chainId: 8453,
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    image: 'https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png'
};

const EURC: Token = {
    address: ASSET_ADDRESSES.BASE.EURC as `0x${string}`,
    chainId: 8453,
    decimals: 6,
    name: 'Euro Coin',
    symbol: 'EURC',
    image: 'https://s2.coinmarketcap.com/static/img/coins/200x200/20641.png'
};

type TokenBalance = {
    address: string;
    chainId: number;
    decimals: number;
    image: string | null;
    name: string;
    symbol: string;
    cryptoBalance: string | number;
    fiatBalance: string | number;
};

type PortfolioData = {
    address: string;
    tokenBalances: TokenBalance[];
    portfolioBalanceInUsd: string;
};


export default function PortfolioPage() {
    const { address } = useAccount();
    const [activeTab, setActiveTab] = useState<'balances' | 'buy'>('balances');
    const [portfolioData, setPortfolioData] = useState<PortfolioData>({
        address: '',
        tokenBalances: [],
        portfolioBalanceInUsd: '0',
    });

    useEffect(() => {
        const fetchPortfolioData = async () => {
            if (!address) return;
            
            try {
                const response = await getPortfolios({
                    addresses: [address as `0x${string}`],
                });
                
                if ('portfolios' in response && response.portfolios && response.portfolios.length > 0) {
                    const portfolio = response.portfolios[0];
                    setPortfolioData({
                        address: portfolio.address,
                        tokenBalances: portfolio.tokenBalances.map((token: TokenBalance) => ({
                            ...token,
                            cryptoBalance: token.cryptoBalance || '0',
                            fiatBalance: token.fiatBalance || '0',
                        })),
                        portfolioBalanceInUsd: String(portfolio.portfolioBalanceInUsd || '0'),
                    });
                }
            } catch (error) {
                console.error('Error fetching portfolio data:', error);
            }
        };
        
        fetchPortfolioData();
    }, [address]);


    const formatCryptoBalance = (balance: string, decimals: number) => {
        const num = parseFloat(balance) / Math.pow(10, decimals);
        return num.toFixed(6);
    };

    const formatFiatBalance = (balance: string) => {
        return `$${parseFloat(balance).toFixed(4)}`;
    };


    if (process.env.NEXT_PUBLIC_NODE_ENV != 'production') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle>This page is only available in Base Mainnet</CardTitle>
                        <CardDescription>
                            Base Sepolia network is not supported for portfolio management.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl container mx-auto py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Portfolio</h1>
                    <p className="text-muted-foreground">Manage your credits and balances</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
                <Button
                    variant={activeTab === 'balances' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('balances')}
                    className="flex-1"
                >
                    Balances
                </Button>
                <Button
                    variant={activeTab === 'buy' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('buy')}
                    className="flex-1"
                >
                    Buy
                </Button>
            </div>

            {activeTab === 'balances' && (
                <div className="space-y-6">
                    {/* Wallet Balance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Dynamically display all tokens in portfolio */}
                        {portfolioData.tokenBalances.map((token) => (
                            <Card key={token.symbol}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <img 
                                                src={token.image || ''} 
                                                alt={token.symbol} 
                                                width={24}
                                                height={24}
                                                className="h-6 w-6 rounded-full"
                                            />
                                            {token.symbol} Balance
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {formatCryptoBalance(
                                            token.cryptoBalance as string || '0',
                                            token.decimals || 18
                                        )} {token.symbol}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{token.name}</p>
                                    <p className="text-xs text-green-600 mt-2">
                                        {formatFiatBalance(token.fiatBalance as string || '0')}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Total Portfolio Value */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <DollarSign className="h-6 w-6" />
                                        Total Portfolio
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {formatFiatBalance(portfolioData.portfolioBalanceInUsd)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Total USD Value</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {portfolioData.tokenBalances.length} tokens
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            )}

            {activeTab === 'buy' && (
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Buy Crypto
                            </CardTitle>
                            <CardDescription>
                                Purchase USDC or EURC with your credit card
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Buy toToken={USDC} />
                            <Buy toToken={EURC} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}