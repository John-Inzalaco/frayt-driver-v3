import {IndexPath, Select, SelectItem, Text} from '@ui-kitten/components';
import {getMarkets, Market} from '@frayt/sdk';
import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';

type MarketPickerProps = {
  onChange?: (market: Market | null) => void;
  testMarkets?: Market[];
};

export function MarketPicker({onChange, testMarkets}: MarketPickerProps) {
  const [region, setRegion] = useState<number | null>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [markets, setMarkets] = useState<Market[]>(() => {
    if (!testMarkets) return [];
    return testMarkets;
  });
  const [regions, setRegions] = useState<string[] | null>(() => {
    if (!testMarkets) return [];
    const updatedRegions = markets.map(m => m.region);
    return [...new Set(updatedRegions)];
  });

  useEffect(() => {
    if (testMarkets) {
      return;
    }
    getMarkets()
      .then(updatedMarkets => {
        if (!updatedMarkets) return;
        initialize(updatedMarkets);
      })
      .catch(err => console.warn(err));
  }, [getMarkets]);

  const initialize = (markets: Market[]) => {
    setMarkets(markets);

    let updatedRegions = markets.map(m => m.region);

    updatedRegions = [...new Set(updatedRegions)];

    setRegions(updatedRegions);
  };

  const updateMarket = (m: Market | null) => {
    onChange && onChange(m);
  };

  const currentMarkets = (): Market[] | null => {
    if (regions && region !== null) {
      return markets.filter(m => m.region === regions[region]);
    }
    return null;
  };

  const renderMarkets = () => {
    if (regions) {
      return regions.map(r => (
        <SelectItem
          key={r}
          title={evaProps => <Text {...evaProps}>{r}</Text>}
        />
      ));
    }
  };

  const renderRegions = () => {
    const marketsToRender = currentMarkets();
    return (
      <>
        {regions &&
          marketsToRender &&
          marketsToRender.map(r => (
            <SelectItem
              key={r.id}
              title={evaProps => <Text {...evaProps}>{r.name}</Text>}
            />
          ))}
      </>
    );
  };

  return (
    <>
      <Select
        placeholder="Select your state "
        testID="stateDropdownTest"
        label="STATE"
        style={styles.select}
        value={region !== null && regions ? regions[region] : undefined}
        onSelect={index => {
          setRegion((index as IndexPath).row);
          setMarket(null);
          updateMarket(null);
        }}>
        {renderMarkets()}
      </Select>
      <Select
        placeholder="Select your market "
        disabled={region === null}
        label="MARKET"
        value={market ? market.name : undefined}
        onSelect={index => {
          const marketList = currentMarkets();
          if (marketList) {
            const selectedMarket =
              marketList[(index as IndexPath).section ?? 0];
            setMarket(selectedMarket);
            updateMarket(selectedMarket);
          }
        }}>
        {renderRegions()}
      </Select>
    </>
  );
}

const styles = StyleSheet.create({
  select: {
    marginBottom: 20,
  },
});
