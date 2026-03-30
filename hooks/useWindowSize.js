const { useState, useLayoutEffect } = require("react")




const useWindowSize = () => {
    const [size, setSize] = useState({width: null, hight: null})

    useLayoutEffect(()=> {
        const handleSzie = () =>{
            setSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }
        handleSzie()

        window.addEventListener('resize', handleSzie)

        return () =>{
            window.removeEventListener('resize', handleSzie)
        }

    },[])

    return size
}

export default useWindowSize