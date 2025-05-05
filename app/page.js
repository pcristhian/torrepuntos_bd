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
  const [premios, setPremios] = useState([]) // Lista de premios
  const [showPremiosModal, setShowPremiosModal] = useState(false) // Control de visibilidad del modal de premios
  const [currentPremioIndex, setCurrentPremioIndex] = useState(0) // Control del índice del premio actual

  useEffect(() => {
    fetchClientes()
    fetchPremios() // Cargar premios
  }, [])

  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clientes').select('*')
    if (error) {
      console.error('Error fetching clientes:', error)
    } else {
      setClientes(data)
    }
  }

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

const handleCheckboxChange = (index) => {
  // Alternar el estado de la bandera
  setClaimedFlags((prevFlags) => {
    const newFlags = [...prevFlags];
    newFlags[index] = !newFlags[index];
    localStorage.setItem("claimedFlags", JSON.stringify(newFlags)); // Guardar el nuevo estado en localStorage
    return newFlags;
  });
};



  const fetchPremios = async () => {
    const premioData = [
      { nombre: 'Taza', puntos: 300, imagen: 'https://res.cloudinary.com/dlll6ncvv/image/upload/v1746280347/premio1_scpcjj.webp' },
      { nombre: 'Juego de 6 Vasos', puntos: 600, imagen: 'https://res.cloudinary.com/dlll6ncvv/image/upload/v1746281979/premio2_qflsmp.jpg' },
      { nombre: 'Alcuza', puntos: 1200, imagen: 'https://res.cloudinary.com/dlll6ncvv/image/upload/v1746281987/premio3_xgxldz.webp' },
      { nombre: 'Termo', puntos: 2500, imagen: 'https://res.cloudinary.com/dlll6ncvv/image/upload/v1746281997/premio4_gzfyon.jpg' },
      { nombre: 'Caldera Electrica', puntos: 2500, imagen: 'https://res.cloudinary.com/dlll6ncvv/image/upload/v1746282050/premio5_xcgqay.png' },
      { nombre: 'Set de Utensilios de Cocina', puntos: 2500, imagen: 'https://res.cloudinary.com/dlll6ncvv/image/upload/v1746282012/premio6_nvs07o.webp' },
    ]
    setPremios(premioData)
  }

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


     

 {/* Modal de canje de premios mmmmmmmm */}

      {/* Modal de canje de premios */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Canjear Premios</h2>
            {premios.map((premio, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <span>{premio.nombre}</span>
                <input 
                  type="checkbox" 
                  checked={!!claimedFlags[index]}  // Asegurarse de que siempre sea un valor booleano
                  onChange={() => handleCheckboxChange(index)} 
                />

             
              </div>
            ))}
            <div className="flex justify-end gap-4 mt-4">
              <button 
                onClick={() => setShowRedeemModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setShowRedeemModal(false)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

{/* Modal de Premios */}
{showPremiosModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">Premios Disponibles</h2>
      <div className="relative text-center">
        <h3 className="text-lg font-semibold text-blue-600">{premios[currentPremioIndex].nombre}</h3>
        <p className="text-blue-500 mb-4">Puntos: {premios[currentPremioIndex].puntos}</p>

        <div className="relative">
          <img
            src={premios[currentPremioIndex].imagen}
            alt={`Premio ${currentPremioIndex + 1}`}
            className="w-full h-48 object-contain rounded-lg mb-4 mx-auto"
          />
          {/* Si el premio ha sido reclamado, mostrar la marca de agua */}
          {claimedFlags[currentPremioIndex] && (
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-xl">
              Reclamado
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handlePreviousPremio}
            className="bg-gray-600 text-white p-2 rounded-full"
          >
            ←
          </button>
          <button
            onClick={handleNextPremio}
            className="bg-gray-600 text-white p-2 rounded-full"
          >
            →
          </button>
        </div>
      </div>
      {/* Botón de Cerrar */}
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
