import { motion } from "framer-motion";

export default function ComboMeter({ combo, tier }) {
 
  return (
    <motion.div
        key={`${tier}-${combo}`} // forces animation restart
        className={`
                    combo 
                    combo-${tier}
                    combo-${tier}-anim 
                  `}    
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [1.4, 1], opacity: 1 }}
        transition={{ duration: 0.25 }}
    >
       COMBO +{combo}
    </motion.div>
  );
}
