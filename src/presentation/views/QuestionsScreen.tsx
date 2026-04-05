import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { useQuestionsScreen } from '../viewmodels/useQuestionsScreen';
import { PreguntaDTO, RespuestaInput } from '../../domain/entities/Pregunta';

function PreguntaCard({
  item,
  onEdit,
  onDelete,
}: Readonly<{ item: PreguntaDTO; onEdit: () => void; onDelete: () => void }>) {
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>#{item.id}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.es_multiple ? 'Múltiple' : 'Simple'}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.respuestas.length} resp.</Text>
          </View>
        </View>
        <Text style={styles.enunciado} numberOfLines={3}>
          {item.enunciado}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RespuestaRow({
  respuesta,
  index,
  canRemove,
  onToggleCorrect,
  onChangeText,
  onRemove,
}: Readonly<{
  respuesta: RespuestaInput;
  index: number;
  canRemove: boolean;
  onToggleCorrect: () => void;
  onChangeText: (v: string) => void;
  onRemove: () => void;
}>) {
  return (
    <View style={styles.respRow}>
      <TouchableOpacity
        onPress={onToggleCorrect}
        style={[styles.correctToggle, respuesta.es_correcta && styles.correctToggleOn]}
      >
        <Text style={styles.correctToggleText}>{respuesta.es_correcta ? '✓' : '○'}</Text>
      </TouchableOpacity>
      <TextInput
        style={[styles.respInput, respuesta.es_correcta && styles.respInputCorrect]}
        placeholder={`Respuesta ${index + 1}`}
        placeholderTextColor="#555"
        value={respuesta.texto}
        onChangeText={onChangeText}
      />
      {canRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function QuestionsScreen() {
  const q = useQuestionsScreen();

  return (
    <View style={styles.container}>
      {q.loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      )}

      {!q.loading && (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Preguntas</Text>
            <TouchableOpacity style={styles.addBtn} onPress={q.openCreate}>
              <Text style={styles.addBtnText}>+ Nueva</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={q.preguntas}
            keyExtractor={(p) => String(p.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No hay preguntas. ¡Crea la primera!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <PreguntaCard
                item={item}
                onEdit={() => q.openEdit(item)}
                onDelete={() => q.handleDelete(item)}
              />
            )}
          />

          {/* Modal confirmación borrar */}
          <Modal
            visible={!!q.deleteTarget}
            transparent
            animationType="fade"
            onRequestClose={q.cancelDelete}
          >
            <View style={styles.deleteOverlay}>
              <View style={styles.deleteDialog}>
                <Text style={styles.deleteDialogTitle}>Eliminar pregunta</Text>
                <Text style={styles.deleteDialogMsg}>
                  {`¿Eliminar "${q.deleteTarget?.enunciado.slice(0, 60)}${(q.deleteTarget?.enunciado.length ?? 0) > 60 ? '...' : ''}"?`}
                </Text>
                {q.deleteError && (
                  <View style={styles.deleteErrorBox}>
                    <Text style={styles.deleteErrorText}>{q.deleteError}</Text>
                  </View>
                )}
                <View style={styles.deleteActions}>
                  <TouchableOpacity
                    style={styles.deleteCancelBtn}
                    onPress={q.cancelDelete}
                    disabled={q.deleting}
                  >
                    <Text style={styles.deleteCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteConfirmBtn, q.deleting && styles.saveBtnDisabled]}
                    onPress={q.confirmDelete}
                    disabled={q.deleting}
                  >
                    {q.deleting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.deleteConfirmText}>Eliminar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal crear / editar */}
          <Modal
            visible={q.modalVisible}
            animationType="slide"
            onRequestClose={q.closeModal}
          >
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {q.editing ? 'Editar pregunta' : 'Nueva pregunta'}
                </Text>
                <TouchableOpacity onPress={q.closeModal}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalBody}>
                <Text style={styles.fieldLabel}>Enunciado</Text>
                <TextInput
                  style={styles.textarea}
                  multiline
                  numberOfLines={3}
                  placeholder="Escribe la pregunta..."
                  placeholderTextColor="#555"
                  value={q.enunciado}
                  onChangeText={q.setEnunciado}
                />

                <View style={styles.switchRow}>
                  <Text style={styles.fieldLabel}>Respuesta múltiple</Text>
                  <Switch
                    value={q.esMultiple}
                    onValueChange={q.setEsMultiple}
                    trackColor={{ true: '#7C3AED', false: '#2D2D44' }}
                    thumbColor="#fff"
                  />
                </View>

                <Text style={styles.fieldLabel}>Respuestas</Text>
                {q.respuestas.map((r, i) => (
                  <RespuestaRow
                    key={`resp-${r.texto}-${i}`}
                    respuesta={r}
                    index={i}
                    canRemove={q.respuestas.length > 2}
                    onToggleCorrect={() => q.updateRespuesta(i, 'es_correcta', !r.es_correcta)}
                    onChangeText={(v) => q.updateRespuesta(i, 'texto', v)}
                    onRemove={() => q.removeRespuesta(i)}
                  />
                ))}

                <TouchableOpacity onPress={q.addRespuesta} style={styles.addRespBtn}>
                  <Text style={styles.addRespText}>+ Añadir respuesta</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, q.saving && styles.saveBtnDisabled]}
                  onPress={q.handleSave}
                  disabled={q.saving}
                >
                  {q.saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>{q.editing ? 'Guardar cambios' : 'Crear pregunta'}</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  center: { flex: 1, backgroundColor: '#0D0D1A', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  addBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
    overflow: 'hidden',
  },
  cardBody: { padding: 16 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  badge: { backgroundColor: '#2D2D44', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  enunciado: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#2D2D44' },
  editBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#2D2D44',
  },
  editBtnText: { color: '#7C3AED', fontWeight: '700', fontSize: 13 },
  deleteBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  deleteBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#64748B', fontSize: 15 },
  modal: { flex: 1, backgroundColor: '#0D0D1A' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  modalClose: { fontSize: 22, color: '#EF4444', fontWeight: '700' },
  modalBody: { padding: 20, gap: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  textarea: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 90,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  respRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  correctToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctToggleOn: { borderColor: '#10B981', backgroundColor: '#10B981' },
  correctToggleText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  respInput: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  respInputCorrect: { borderColor: '#10B981' },
  removeBtn: { padding: 8 },
  removeBtnText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
  addRespBtn: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addRespText: { color: '#7C3AED', fontWeight: '700', fontSize: 14 },
  saveBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  deleteDialog: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D2D44',
    padding: 24,
    width: '100%',
    gap: 16,
  },
  deleteDialogTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  deleteDialogMsg: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  deleteErrorBox: {
    backgroundColor: '#2D1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 12,
  },
  deleteErrorText: { color: '#EF4444', fontSize: 13 },
  deleteActions: { flexDirection: 'row', gap: 12 },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2D44',
    alignItems: 'center',
  },
  deleteCancelText: { color: '#94A3B8', fontWeight: '700', fontSize: 14 },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  deleteConfirmText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
