import React, { useState, MouseEvent, useEffect } from 'react';
import { Button, Popover } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBriefcase, faGraduationCap, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faCamera, faHeart, faStar, faMusic, faCoffee, faFlag, faBook, faEnvelope, faBicycle } from '@fortawesome/free-solid-svg-icons';
import { faGlobe, faBell, faBolt, faAnchor, faLeaf, faFire, faGift, faPaw, faRocket } from '@fortawesome/free-solid-svg-icons';
import { Row } from 'react-bootstrap';

interface IconPopoverProps {
    onIconClick?: (iconKey: string, iconColor: string) => void; // Esta es la prop de la función de callback
    defaultIcon?: string;
  }
interface IconOptions {
  [key: string]: IconDefinition;
}

const IconPopover: React.FC<IconPopoverProps> = ({ onIconClick,defaultIcon }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [popOpen, setPopOpen] = useState<boolean>(false);

  const iconColors: { [key: string]: string } = {
    home: 'blue',
    briefcase: 'grey',
    school: 'yellow',
    camera: 'red',
    heart: 'pink',
    star: 'orange',
    music: 'purple',
    coffee: 'brown',
    flag: 'red',
    book: 'white',
    envelope: 'grey',
    bicycle: 'blue',
    globe: 'green',
    bell: 'yellow',
    bolt: 'red',
    anchor: 'pink',
    leaf: 'orange',
    fire: 'purple',
    gift: 'brown',
    paw: 'white',
    rocket: 'white',

  };

  const icons: IconOptions = {
    home: faHome,
    briefcase: faBriefcase,
    school: faGraduationCap,
    camera: faCamera,
    heart: faHeart,
    star: faStar,
    music: faMusic,
    coffee: faCoffee,
    flag: faFlag,
    book: faBook,
    envelope: faEnvelope,
    bicycle: faBicycle,
    globe: faGlobe,
    bell: faBell,
    bolt: faBolt,
    anchor: faAnchor,
    leaf: faLeaf,
    fire: faFire,
    gift: faGift,
    paw: faPaw,
    rocket: faRocket,
  };

  useEffect(() => {
    if (defaultIcon && defaultIcon!='') {
      setSelectedIcon(defaultIcon)
    }
  }, [defaultIcon])
  

  const content = 
  <div className=' m-0 p-0' >
  {
    Object.keys(icons).map((iconKey) => (
        <FontAwesomeIcon 
          className='col-1'
          key={iconKey}
          icon={icons[iconKey]} 
          size="2x"
          onClick={() => handleIconClick(iconKey,  iconColors[iconKey])}
          style={{cursor: 'pointer', margin: '8px', color: iconColors[iconKey]}}
        />
    ))
  }
  </div>

  

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

 

  const handleIconClick = (iconKey: string, iconColor: string) => {
    setPopOpen(!popOpen);
    const stylesIcon= {class: `fa-solid fa-${iconKey}`, color: iconColor}
    setSelectedIcon(JSON.stringify(stylesIcon))

    if(onIconClick) { // Verificar que la función de callback se pasó como prop
      onIconClick(iconKey, iconColor); // Llama a la función de callback con los valores que quieres devolver
    }
  };

  return (
    <div className=''>
      
      <Popover placement="right" open={popOpen} title={<p className='text-white border-bottom '>Selecciona un icono</p>} content={content} trigger="click">
      <i onClick={e=>setPopOpen(!popOpen)}  className= {selectedIcon?JSON.parse(selectedIcon).class:'fa-solid text-primary fa-icons fs-5 p-0 m-0'} style={{color: selectedIcon?JSON.parse(selectedIcon).color:'white'}}  ></i>
      </Popover>
    </div>
  );
}

export default IconPopover;