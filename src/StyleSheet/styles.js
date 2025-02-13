// styles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    marginBottom: 15,
  },
  scrollView: {
    width: '100%',
    flexGrow: 1,
  },
});

export default styles;
