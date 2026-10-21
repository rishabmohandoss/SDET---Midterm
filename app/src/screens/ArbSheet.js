import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { ARBS } from '../data';
import { useApp } from '../store';
import { Label, Row, Txt } from '../ui';

export default function ArbSheet({ visible, onClose }) {
  const { t } = useApp();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(5,6,8,.72)', justifyContent: 'flex-end' }}>
        <Pressable onPress={() => {}} style={{ maxHeight: '86%', backgroundColor: t.card, borderTopWidth: 2, borderTopColor: t.acc, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.strong, alignSelf: 'center', marginTop: 8 }} />
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <Row style={{ padding: 18, paddingBottom: 10 }}>
              <View><Label>⚡ ARBITRAGE RADAR</Label><Txt f="sansB" size={18} style={{ marginTop: 3 }}>Weather-driven spreads</Txt></View>
              <Pressable onPress={onClose} accessibilityLabel="Close" style={{ width: 44, height: 44, borderWidth: 1, borderColor: t.strong, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}><Txt f="monoM" size={16} c="muted">×</Txt></Pressable>
            </Row>
            <View style={{ marginHorizontal: 14, padding: 14, backgroundColor: t.raised, borderWidth: 1, borderColor: t.line, borderRadius: 12 }}>
              <Txt f="monoM" size={10} c="muted">TOP SPREAD · HENRY HUB vs TRANSCO Z6</Txt>
              <Txt f="monoB" size={46} c="up" style={{ marginVertical: 6, lineHeight: 52 }}>$1.40</Txt>
              <Txt size={13} c="body" style={{ lineHeight: 19 }}>Freezing temperatures in NY against mild conditions in TX created a $1.40 Henry Hub vs Transco Z6 natural gas price spread. Pipeline at 98% utilization caps arbitrage flow.</Txt>
            </View>
            <View style={{ padding: 14, paddingBottom: 0, gap: 8 }}>
              {ARBS.map(([pair, driver, a, b, spread, col, conf]) => (
                <View key={pair} style={{ padding: 14, borderWidth: 1, borderColor: t.line, borderRadius: 12, backgroundColor: t.bg }}>
                  <Row><Txt f="sansB" size={14} style={{ flex: 1 }}>{pair}</Txt><Txt f="monoB" size={15} c={col}>{spread}</Txt></Row>
                  <Txt size={12} c="muted" style={{ marginTop: 3, marginBottom: 8 }}>{driver}</Txt>
                  <Row><Txt f="monoM" size={11}>{a} → {b}</Txt><Txt f="monoM" size={11} c="acc">CONF {conf}</Txt></Row>
                </View>
              ))}
            </View>
            <Txt f="mono" size={10} c="muted" style={{ padding: 18, paddingBottom: 0 }}>Illustrative data. Not investment advice.</Txt>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
