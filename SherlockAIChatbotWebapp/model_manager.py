# model_manager.py

from llama_cpp import Llama
import torch
import logging
from transformers import AutoTokenizer, AutoModelForCausalLM

class ModelManager:
    def __init__(self, model_path):
        self.model_path = model_path
        self.model = None
        self.status = 'not_loaded'

    def load_model(self):
        try:
            self.status = 'loading'
            # Use CUDA if available
            n_gpu_layers = -1 if torch.cuda.is_available() else 0
            self.model = Llama(
                model_path=self.model_path,
                n_ctx=2048,
                chat_format=None,
                n_gpu_layers=n_gpu_layers,
                n_threads=8,
                verbose=False,  # Set to True for debugging
            )
            self.status = 'ready'
        except Exception as e:
            self.status = 'failed'
            print(f"Error loading model: {str(e)}")
        


    def unload_model(self):
        if self.model:
            del self.model
            self.model = None
            self.status = 'not_loaded'
        else:
            raise Exception("No model is currently loaded")

    def get_status(self):
        return {'status': self.status}

    def inference(self, messages):
        if self.status != 'ready':
            raise Exception("Model is not ready")

        prompt = self.format_prompt(messages)

        
        
        print("Formatted prompt sent to the model:")
        print("-----------------------------------")
        print(prompt)
        print("-----------------------------------")

        logging.info(f"Formatted prompt: {prompt}")

        try:
            response = self.model(
                prompt,
                max_tokens=1000,
                stop=['<|eot_id|>'],
                echo=False,
                grammar=None,
            )
            return response['choices'][0]['text'].strip()
        except Exception as e:
            logging.error(f"Error during inference: {str(e)}")
            raise

    def format_prompt(self, messages):
        #formatted_prompt = "<|begin_of_text|>"
        formatted_prompt = ""
        for message in messages:
            role = message['role']
            content = message['content']
            formatted_prompt += f"<|start_header_id|>{role}<|end_header_id|>\n{content}<|eot_id|>"
            
        # Add the assistant header at the end to prompt the model to generate a response
        formatted_prompt += "<|start_header_id|>assistant<|end_header_id|>"
        
        return formatted_prompt
    