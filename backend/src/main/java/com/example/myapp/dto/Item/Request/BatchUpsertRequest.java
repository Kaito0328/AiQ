package com.example.myapp.dto.Item.Request;

import java.util.List;

public record BatchUpsertRequest<Input>(List<CreateRequest<Input>> createsRequest,
                List<UpdateRequest<Input>> updatesRequest) {

}
