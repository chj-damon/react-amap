import React, { useRef, useEffect, useImperativeHandle } from 'react';
import { useMap } from '../map';
import { usePropsReactive } from '../hooks';
import type { EllipseProps, EllipseType } from './types';
import { allProps, setterMap, converterMap } from './config';

const Ellipse: EllipseType = (props = {}, ref) => {
  const { map } = useMap();
  const instanceObj = useRef<AMap.Ellipse>(null);

  const { loaded, onInstanceCreated } = usePropsReactive<AMap.Ellipse, EllipseProps>(props, {
    setterMap,
    converterMap
  });

  useEffect(
    () => {
      if (map) {
        createInstance()
          .then(() => {
            onInstanceCreated?.(instanceObj.current)
          })
      }
    },
    [map]
  );

  useImperativeHandle(
    ref,
    () => instanceObj.current,
    [instanceObj.current]
  );

  const createInstance = () => {
    const options = buildCreateOptions()
    options.map = map;
    instanceObj.current = new window.AMap.Ellipse(options);
    return Promise.resolve();
  }

  const buildCreateOptions = () => {
    const options: AMap.Ellipse.Options = {}
    allProps.forEach((key) => {
      if (key in props) {
        if (key === 'style' && (props.style !== undefined)) {
          const styleItem = Object.keys(props.style)
          styleItem.forEach((item) => {
            options[item] = props.style[item]
          })
        } else if (key !== 'visible') {
          options[key] = getSetterValue(key, props)
        }
      }
    })
    return options;
  }

  /**
   * 处理需要转换的参数
   * @param key
   * @param props
   * @returns
   */
  const getSetterValue = (key: string, props: EllipseProps) => {
    if (key in converterMap) {
      return converterMap[key](props[key])
    }
    return props[key];
  }

  const renderEditor = (children: any) => {
    if (!children) {
      return null
    }
    if (React.Children.count(children) !== 1) {
      return null
    }
    return React.cloneElement(React.Children.only(children), {
      ellipse: instanceObj.current,
      map: map
    })
  }

  return loaded ? renderEditor(props.children) : null
}

export default React.forwardRef(Ellipse);
