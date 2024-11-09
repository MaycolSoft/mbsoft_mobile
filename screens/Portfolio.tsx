import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const API_URL = 'https://rickandmortyapi.com/api/character';
const MAX_ITEMS = 50;

interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  image: string;
}

const CharacterList: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    if (loading || !hasMore) return;
  
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}?page=${page}`);
      const newCharacters = response.data.results;
  
      // Si el total excede el máximo, recorta la lista para mantener los últimos 50
      setCharacters((prevCharacters) => {
        const combined = [...prevCharacters, ...newCharacters];
        return combined.length > MAX_ITEMS ? combined.slice(-MAX_ITEMS) : combined;
      });
  
      setPage((prevPage) => prevPage + 1);
      setHasMore(!!response.data.info.next);
    } catch (error) {
      if (error.response?.data?.error === 'There is nothing here') {
        setHasMore(false);
      } else {
        Alert.alert('Error', 'No se pudo cargar los personajes.');
      }
    } finally {
      setLoading(false);
    }
  };


  const CharacterItem = React.memo(({ item }: { item: Character }) => (
    <View style={[styles.characterContainer]}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>{item.species}</Text>
        <Text>{item.status}</Text>
        <Text>{item.gender}</Text>
      </View>
    </View>
  ));

  
  // const renderCharacter = ({ item }: { item: Character }) => (
  //   <View style={styles.characterContainer}>
  //     <Image source={{ uri: item.image }} style={styles.image} />
  //     <View style={styles.info}>
  //       <Text style={styles.name}>{item.name}</Text>
  //       <Text>{item.species}</Text>
  //       <Text>{item.status}</Text>
  //       <Text>{item.gender}</Text>
  //     </View>
  //   </View>
  // );
  const renderCharacter = ({ item }: { item: Character }) => <CharacterItem item={item} />;


  return (
    <View style={[styles.container]}>
      {loading && characters.length === 0 ? ( // Muestra el loader centrado solo si está cargando al inicio
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCharacter}
          onEndReached={loadCharacters}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator size="large" color="#0000ff" /> : null
          }
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          getItemLayout={(data, index) => ({ length: 70, offset: 70 * index, index })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: { // Nuevo estilo para centrar el loading
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  info: {
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
  },
});


export default CharacterList;
