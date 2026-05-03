package com.zoo.booking.addons.service;

import com.zoo.booking.addons.entity.AddOn;
import com.zoo.booking.addons.repository.AddOnRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddOnService {

    private final AddOnRepository addOnRepository;

    public AddOnService(AddOnRepository addOnRepository) {
        this.addOnRepository = addOnRepository;
    }

    public List<AddOn> getAllAddOns() {
        return addOnRepository.findAll();
    }

    public List<AddOn> getActiveAddOns() {
        return addOnRepository.findByIsActiveTrue();
    }

    @Transactional
    public AddOn createAddOn(AddOn addOn) {
        return addOnRepository.save(addOn);
    }

    @Transactional
    public AddOn updateAddOn(Long id, AddOn addOn) {
        addOn.setId(id);
        return addOnRepository.save(addOn);
    }

    @Transactional
    public AddOn toggleAddOn(Long id) {
        AddOn addOn = addOnRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Add-on not found"));
        addOn.setIsActive(!Boolean.TRUE.equals(addOn.getIsActive()));
        return addOnRepository.save(addOn);
    }

    @Transactional
    public void deleteAddOn(Long id) {
        addOnRepository.deleteById(id);
    }
}
