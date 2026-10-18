import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.EXPO_PUBLIC_API_URL; // http://localhost:5000

  // 1. Cargar Items (GET) - Spec-Driven
  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items`);
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar:", error);
      setLoading(false);
    }
  };

  // 2. Guardar Item (POST) - BMAD Business
  const saveItem = async () => {
    if (!name || !price) return alert("Llena los campos");
    
    try {
      await axios.post(`${API_URL}/items`, {
        name: name,
        description: "Producto de segunda vida",
        price: parseFloat(price)
      });
      setName('');
      setPrice('');
      fetchItems(); // Recargar lista
    } catch (error) {
      alert("Error al guardar en .NET");
    }
  };

  useEffect(() => { fetchItems(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Segunda Vida Store</Text>
      
      {/* Formulario de Registro */}
      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Nombre del producto" 
          value={name} 
          onChangeText={setName} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Precio" 
          value={price} 
          keyboardType="numeric" 
          onChangeText={setPrice} 
        />
        <Button title="Publicar Producto" onPress={saveItem} color="#2ecc71" />
      </View>

      <Text style={styles.subtitle}>Productos Disponibles:</Text>
      
      {loading ? <ActivityIndicator size="large" /> : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: '600', marginVertical: 10 },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, elevation: 3 },
  input: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginBottom: 15, padding: 8 },
  itemCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 16, fontWeight: '500' },
  itemPrice: { color: '#2ecc71', fontWeight: 'bold' }
});