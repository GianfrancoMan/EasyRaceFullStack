package org.manca.racing_circuit_behind.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SerializationService {
    @Value("${org.manca.temp}")
    private String TEMPORARY_PATH;

    /**
     * Serialize and returns the object passed as parameter.
     * 
     * @param obj the object to serialize
     * @param fileName The filename that will be returned
     * @return a java.io.File instance
     * @throws IOException
     */
    public File serialize(Object obj, String fileName) throws IOException {

        // Serialize the object to a file
        File file = new File(fileName);
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(file))) {
            oos.writeObject(obj);
        }

        return file;
    }

    
    public Object deserialize(File file) {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file))) {
             return ois.readObject();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Clears The Temporary Folder
     * Used when some operations terminate suddenly.
     */
    public void clearSerializationContext() {
        try {
            File temporaryFolder = new File(TEMPORARY_PATH);
            var files = temporaryFolder.listFiles();
            var index = files.length -1;
            while(index >=0) {
                files[index].delete();
                files = temporaryFolder.listFiles();
                index = files.length-1;
            }        
        } catch (SecurityException e) {
           System.out.println("SecurityExceptionOccurred");
        }
    }

    
}
