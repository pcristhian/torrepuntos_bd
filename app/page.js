'use client'

import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export default function Page() {
  const [clientes, setClientes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [newClientData, setNewClientData] = useState({
    codigo: '',
    nombre: '',
    apellido: '',
    puntos: '',
    imagen: null,
  })
  const [showMenu, setShowMenu] = useState(false)
  const [error, setError] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loginAttempts, setLoginAttempts] = useState(0)

  const [premios, setPremios] = useState([]);
const [currentPremioIndex, setCurrentPremioIndex] = useState(0);
const [showPremiosModal, setShowPremiosModal] = useState(false);


const fetchClientes = async () => {
  const { data, error } = await supabase.from('clientes').select('*');
  if (error) {
    console.error('Error fetching clientes:', error);
  } else {
    setClientes(data);
  }
};

const fetchPremios = async () => {
  const { data, error } = await supabase
    .from('premios')
    .select('id, nombre, puntos, imagen, reclamado')

  if (error) {
    console.error('Error al obtener premios:', error);
  } else {
    setPremios(data);
    setCurrentPremioIndex(0);
  }
};

useEffect(() => {
  fetchClientes();
}, []);

useEffect(() => {
  if (showPremiosModal) {
    fetchPremios();
  }
}, [showPremiosModal]);


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewClientData(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setNewClientData(prevData => ({
      ...prevData,
      imagen: file,
    }))
  }

  const handleAddClient = async () => {
    setShowModal(true)
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()

    if (loginAttempts >= 2) {
      setShowModal(false)
      return
    }

    const { data } = await supabase
      .from('usuarios_admin')
      .select('*')
      .eq('usuario', usuario)
      .eq('password', password)
      .single()

    if (data) {
      setIsLoggedIn(true)
      setShowModal(false)
      setShowNewClientModal(true)
    } else {
      setLoginAttempts(prev => prev + 1)
      setError('Usuario o contraseña incorrectos.')

      if (loginAttempts + 1 >= 2) {
        setShowModal(false)
      }
    }
  }

  const handleAddClientAfterLogin = async () => {
    if (!isLoggedIn) return

    let imageUrl = ''
    if (newClientData.imagen) {
      const { data, error: uploadError } = await supabase.storage
        .from('imagenes')
        .upload(`clientes/${newClientData.imagen.name}`, newClientData.imagen)


      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return
      }
      imageUrl = data?.path
    }

    const { error } = await supabase.from('clientes').insert([{
      codigo: newClientData.codigo,
      nombre: newClientData.nombre,
      apellido: newClientData.apellido,
      puntos: newClientData.puntos,
      imagen: imageUrl,
    }])

    if (error) {
      console.error('Error adding client:', error)
    } else {
      fetchClientes()
      setShowNewClientModal(false)
      setNewClientData({ codigo: '', nombre: '', apellido: '', puntos: '', imagen: null })
    }
  }


  const [showRedeemModal, setShowRedeemModal] = useState(false);

const [claimedFlags, setClaimedFlags] = useState(premios.map(premio => premio.reclamado));

useEffect(() => {
  const storedFlags = JSON.parse(localStorage.getItem("claimedFlags"));
  if (storedFlags) {
    setClaimedFlags(storedFlags); // Si existe, se usa el valor guardado
  }
}, []);


const handleCheckboxChange = async (index) => {
  const premio = premios[index];

  // Alternar el valor de "reclamado"
  const nuevoEstado = !premio.reclamado;

  // Actualizar en la base de datos
  const { error } = await supabase
    .from('premios')
    .update({ reclamado: nuevoEstado })
    .eq('id', premio.id); // Asegúrate de que cada premio tiene un campo "id" único

  if (error) {
    console.error('Error actualizando premio:', error);
    return;
  }

  // Actualizar el estado local
  const nuevosPremios = [...premios];
  nuevosPremios[index].reclamado = nuevoEstado;
  setPremios(nuevosPremios);
};





  const toggleMenu = () => {
    setShowMenu(prev => !prev)
  }

  const handlePreviousPremio = () => {
    setCurrentPremioIndex((prevIndex) => (prevIndex === 0 ? premios.length - 1 : prevIndex - 1))
  }

  const handleNextPremio = () => {
    setCurrentPremioIndex((prevIndex) => (prevIndex === premios.length - 1 ? 0 : prevIndex + 1))
  }
 
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Menú superior fijo */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={toggleMenu}
          className="bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        >
          ☰
        </button>
        {showMenu && (
          <div className="mt-2 bg-white shadow-lg rounded-lg p-2 space-y-2 w-48">
          <button
  onClick={() => {
    handleAddClient()
    setShowMenu(false)
  }}
  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600"
>
  Agregar nuevo cliente
</button>



<button 
  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-blue-600"
  onClick={() => setShowRedeemModal(true)}
>
  Canjear premios
</button>




          </div>
        )}
      </div>

      {/* Botón de Ver Premios en la parte inferior */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => setShowPremiosModal(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg"
        >
          Ver Premios
        </button>
      </div>



 {/* Modal de mostrar de premios mmmmmmmm */}

{showPremiosModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">Premios Disponibles</h2>

      {premios.length > 0 ? (
        <div className="relative text-center">
          <h3 className="text-lg font-semibold text-blue-600">{premios[currentPremioIndex].nombre}</h3>
          <p className="text-blue-500 mb-4">Puntos: {premios[currentPremioIndex].puntos}</p>

          <div className="relative">
            <img
              src={premios[currentPremioIndex].imagen}
              alt={`Premio ${currentPremioIndex + 1}`}
              className="w-full h-48 object-contain rounded-lg mb-4 mx-auto"
            />
            {premios[currentPremioIndex].reclamado && (
              <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-xl">
                Reclamado
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <button onClick={handlePreviousPremio} className="bg-gray-600 text-white p-2 rounded-full">←</button>
            <button onClick={handleNextPremio} className="bg-gray-600 text-white p-2 rounded-full">→</button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Cargando premios...</p>
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowPremiosModal(false)}
          className="bg-red-600 text-white px-4 py-2 rounded mt-4"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

{showRedeemModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">Canjear Premios</h2>

      {premios.length > 0 ? (
        <ul className="space-y-4">
          {premios.map((premio, index) => (
            <li key={premio.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-semibold text-blue-600">{premio.nombre}</p>
                <p className="text-sm text-gray-600">Puntos: {premio.puntos}</p>
              </div>
              <input
                type="checkbox"
                checked={premio.reclamado}
                onChange={() => handleCheckboxChange(index)}
                className="w-5 h-5"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">Cargando premios...</p>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setShowRedeemModal(false)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

      {/* Modal de Login */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Iniciar sesión</h2>
            <form onSubmit={handleLoginSubmit}>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Usuario"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full p-2 border rounded mb-2"
              />
              {error && <p className="text-red-500">{error}</p>}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Iniciar sesión
              </button>
            </form>
            <p className="mt-2 text-gray-500 text-sm">
              Intentos fallidos: {loginAttempts} / 2
            </p>
          </div>
        </div>
      )}

      {/* Modal para agregar cliente */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Registrar Nuevo Cliente</h2>
            <input
              type="text"
              name="codigo"
              value={newClientData.codigo}
              onChange={handleInputChange}
              placeholder="Código"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="nombre"
              value={newClientData.nombre}
              onChange={handleInputChange}
              placeholder="Nombre"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              name="apellido"
              value={newClientData.apellido}
              onChange={handleInputChange}
              placeholder="Apellido"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              name="puntos"
              value={newClientData.puntos}
              onChange={handleInputChange}
              placeholder="Puntos"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowNewClientModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddClientAfterLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      

      {/* Mostrar clientes en tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {clientes.map((cliente) => (
          <div
            key={cliente.codigo}
            className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            <h3 className="text-xl font-semibold text-blue-600">{cliente.nombre} {cliente.apellido}</h3>
            <p className="text-gray-600">Puntos: {cliente.puntos}</p>
            <p className="text-gray-600">Código: {cliente.codigo}</p>
            {cliente.imagen && (
              <img
              src={`https://upkwebdoxejywsrdqodo.supabase.co/storage/v1/object/public/imagenes/${cliente.imagen}`}

                alt={cliente.nombre}
                className="w-32 h-32 object-cover mt-4 rounded-lg mx-auto"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
