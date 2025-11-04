import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
} from 'react-native';
import NovoLoteModal from '@/components/novo_lote';
import NovaColetaModal from '@/components/nova_coleta';
import NovaArvoreModal from '@/components/nova_arvore';


interface AddModalProps {
    visible: boolean;
    onClose: () => void;
}

const AddModal: React.FC<AddModalProps> = ({ visible, onClose }) => {
    const [novoLoteVisible, setNovoLoteVisible] = useState(false);
    const [novaColetaVisible, setNovaColetaVisible] = useState(false);
    const [novaArvoreVisible, setNovaArvoreVisible] = useState(false); // Estado para o novo modal

    return (
        <>
            {/* Modal principal de opções */}
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>

                <View style={styles.container}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>O que gostaria de fazer agora?</Text>

                    <View style={styles.optionList}>
                        {/* Nova Coleta */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => setNovaColetaVisible(true)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#da8a5534' }]}>
                                <Ionicons name="add" size={32} color='#c3743f'  />
                            </View>
                            <View style={styles.textBox}>
                                <Text style={styles.optionTitle}>Registrar Nova Colheita</Text>
                                <Text style={styles.optionSubtitle}>
                                    Registre uma nova colheita
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                        {/* Nova Árvore */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => setNovaArvoreVisible(true)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
                                <Ionicons name="leaf" size={22} color='#16a34a'  />
                            </View>
                            <View style={styles.textBox}>
                                <Text style={styles.optionTitle}>Cadastrar nova árvore</Text>
                                <Text style={styles.optionSubtitle}>
                                    Cadastre uma nova árvore plantada
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                        {/* Novo Lote */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => setNovoLoteVisible(true)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#558b722b' }]}>
                                <Ionicons name="logo-buffer" size={22} color="#1f2937" />
                            </View>
                            <View style={styles.textBox}>
                                <Text style={styles.optionTitle}>Cadastrar novo lote</Text>
                                <Text style={styles.optionSubtitle}>
                                    Cadastre uma nova área de plantio
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Modal da Nova Coleta */}
            <NovaColetaModal
                visible={novaColetaVisible}
                onClose={() => {
                    setNovaColetaVisible(false);
                    onClose();
                }}
                onSuccess={(novaColeta) => {
                    console.log('Nova coleta criada:', novaColeta);
                }}
            />
            {/* Modal da Nova Árvore */}
            <NovaArvoreModal
                visible={novaArvoreVisible}
                onClose={() => {
                    setNovaArvoreVisible(false);
                    onClose();
                } }
                onSuccess={(novaArvore) => {
                    console.log('Nova árvore registrada:', novaArvore);
                } }            />
            {/* Modal do Novo Lote */}
            <NovoLoteModal
                visible={novoLoteVisible}
                onClose={() => {
                    setNovoLoteVisible(false);
                    onClose();
                }}
                onSuccess={(novoLote) => {
                    console.log('Novo lote criado:', novoLote);
                }}
            />
        </>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    handle: {
        width: 48,
        height: 4,
        backgroundColor: '#d1d5db',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 20,
    },
    optionList: { gap: 10 },
    option: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textBox: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    optionSubtitle: {
        fontSize: 13,
        color: '#6b7280',
    },
    cancelButton: {
        marginTop: 16,
        alignSelf: 'center',
        paddingVertical: 12,
    },
    cancelText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
});

export default AddModal;
